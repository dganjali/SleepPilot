#!/usr/bin/env python3
import argparse
import os
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torchaudio
import tarfile
import tempfile
import shutil
from sklearn.metrics import classification_report
from torch.utils.data import DataLoader, Dataset as TorchDataset
from tqdm import tqdm
import gc
from collections import Counter

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

dev = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class LargerConfig:
    def __init__(self):
        self.sample_rate = 16000
        self.n_mels = 64
        self.win_length = 1024
        self.hop_length = 256
        self.fmin = 50
        self.fmax = 8000
        self.window_seconds = 5.0
        self.batch_size = 16
        self.epochs = 5
        self.lr = 1e-3
        # Map DreamCatcher labels to our labels
        self.label_mapping = {
            "snore": "snoring",
            "apnea": "apnea", 
            "movements": "micro_awakenings",
            "cough": "coughing",
            "breathe": "micro_awakenings",
            "swallow": "micro_awakenings",
            "somniloquy": "micro_awakenings",
            "bruxism": "micro_awakenings"
        }
        self.label_names = ("snoring", "apnea", "micro_awakenings", "coughing")

class MelSpec(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.melspec = torchaudio.transforms.MelSpectrogram(
            sample_rate=cfg.sample_rate,
            n_fft=cfg.win_length,
            win_length=cfg.win_length,
            hop_length=cfg.hop_length,
            f_min=cfg.fmin,
            f_max=cfg.fmax,
            n_mels=cfg.n_mels,
            power=2.0,
        )
        self.amp_to_db = torchaudio.transforms.AmplitudeToDB(stype="power")

    def forward(self, wav):
        S = self.melspec(wav)
        S_db = self.amp_to_db(S + 1e-10)
        return S_db

def extract_files_to_disk(tar_path, extract_dir, max_files_per_label=50):
    """Extract files to disk for faster training"""
    print(f"Extracting files from {tar_path} to {extract_dir}...")
    
    # Create extraction directory
    os.makedirs(extract_dir, exist_ok=True)
    
    # Keep tar file open for entire extraction
    with tarfile.open(tar_path, 'r:gz') as tar:
        file_list = tar.getnames()
        
        # Get audio files
        audio_files = [f for f in file_list if f.endswith('.wav') or f.endswith('.flac')]
        
        # Group by label
        files_by_label = {}
        for file_path in audio_files:
            path_parts = file_path.split('/')
            if len(path_parts) >= 6:
                label = path_parts[-2]
                if label not in files_by_label:
                    files_by_label[label] = []
                files_by_label[label].append(file_path)
        
        print(f"Found labels: {list(files_by_label.keys())}")
        for label, files in files_by_label.items():
            print(f"  {label}: {len(files)} files")
        
        # Extract files, limiting per label
        extracted_files = []
        for label, files in files_by_label.items():
            # Sample files if too many
            if len(files) > max_files_per_label:
                files = random.sample(files, max_files_per_label)
            
            print(f"Extracting {len(files)} files for label '{label}'...")
            label_dir = os.path.join(extract_dir, label)
            os.makedirs(label_dir, exist_ok=True)
            
            for i, file_path in enumerate(tqdm(files, desc=f"Extracting {label}")):
                try:
                    # Extract file
                    member = tar.getmember(file_path)
                    audio_data = tar.extractfile(member).read()
                    
                    # Save to disk
                    filename = os.path.basename(file_path)
                    save_path = os.path.join(label_dir, filename)
                    
                    with open(save_path, 'wb') as f:
                        f.write(audio_data)
                    
                    extracted_files.append((save_path, label))
                    
                except Exception as e:
                    print(f"Error extracting {file_path}: {e}")
                    continue
    
    print(f"Extracted {len(extracted_files)} files to {extract_dir}")
    return extracted_files

def get_extracted_files(extract_dir):
    """Get list of extracted files"""
    files = []
    for label in os.listdir(extract_dir):
        label_dir = os.path.join(extract_dir, label)
        if os.path.isdir(label_dir):
            for filename in os.listdir(label_dir):
                if filename.endswith(('.wav', '.flac')):
                    file_path = os.path.join(label_dir, filename)
                    files.append((file_path, label))
    return files

class ExtractedDataset(TorchDataset):
    def __init__(self, cfg, file_list):
        self.cfg = cfg
        self.file_list = file_list
        self.melspec = MelSpec(cfg)
        
        print(f"Extracted dataset size: {len(self.file_list)}")

    def __len__(self):
        return len(self.file_list)

    def __getitem__(self, idx):
        try:
            file_path, label = self.file_list[idx]
            
            # Load audio directly from disk
            wav, sr = torchaudio.load(file_path)
            
            # Convert to mono if stereo
            if wav.shape[0] > 1:
                wav = wav.mean(dim=0, keepdim=True)
            
            # Resample if needed
            if sr != self.cfg.sample_rate:
                wav = torchaudio.functional.resample(wav, sr, self.cfg.sample_rate)
            
            # Remove channel dimension if present
            if wav.ndim > 1:
                wav = wav.squeeze(0)
            
            # Pad or truncate to window size
            target_length = int(self.cfg.window_seconds * self.cfg.sample_rate)
            if wav.shape[-1] < target_length:
                wav = torch.nn.functional.pad(wav, (0, target_length - wav.shape[-1]))
            else:
                wav = wav[:target_length]
            
            # Create mel spectrogram
            spec = self.melspec(wav)
            spec = (spec - spec.mean()) / (spec.std() + 1e-6)
            spec = spec.transpose(0, 1).contiguous()
            
            # Create labels
            y = np.zeros(len(self.cfg.label_names), dtype=np.float32)
            
            if label in self.cfg.label_mapping:
                mapped_label = self.cfg.label_mapping[label]
                if mapped_label in self.cfg.label_names:
                    y[self.cfg.label_names.index(mapped_label)] = 1.0
            
            return spec.float(), torch.from_numpy(y)
            
        except Exception as e:
            print(f"Error processing sample {idx}: {e}")
            # Return a dummy sample
            spec = torch.zeros(100, self.cfg.n_mels)
            y = torch.zeros(len(self.cfg.label_names))
            return spec.float(), y

class CNNLSTMMultiLabel(nn.Module):
    def __init__(self, n_mels, num_labels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(n_mels, 128, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(128),
            nn.Conv1d(128, 128, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(128),
        )
        self.lstm = nn.LSTM(input_size=128, hidden_size=128, num_layers=1, batch_first=True, bidirectional=True)
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(128, num_labels),
        )

    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.conv(x)
        x = x.transpose(1, 2)
        out, _ = self.lstm(x)
        pooled = out.mean(dim=1)
        logits = self.classifier(pooled)
        return logits

def collate_fn(batch):
    specs, ys = zip(*batch)
    max_T = max(s.shape[0] for s in specs)
    n_mels = specs[0].shape[1]
    xs = torch.zeros(len(specs), max_T, n_mels)
    for i, s in enumerate(specs):
        xs[i, :s.shape[0]] = s
    ys = torch.stack(ys).float()
    return xs, ys

def train_one_epoch(model, loader, optim_, loss_fn):
    model.train()
    total = 0.0
    for x, y in tqdm(loader, desc="train", leave=False):
        x = x.to(dev)
        y = y.to(dev)
        optim_.zero_grad(set_to_none=True)
        logits = model(x)
        loss = loss_fn(logits, y)
        loss.backward()
        optim_.step()
        total += float(loss.item()) * x.size(0)
        
        # Clear memory
        del x, y, logits, loss
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    return total / max(1, len(loader.dataset))

def evaluate(model, loader):
    model.eval()
    preds = []
    trues = []
    with torch.no_grad():
        for x, y in tqdm(loader, desc="eval", leave=False):
            x = x.to(dev)
            logits = model(x)
            p = torch.sigmoid(logits).cpu().numpy()
            preds.append(p)
            trues.append(y.numpy())
            
            # Clear memory
            del x, logits, p
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
    
    preds = np.concatenate(preds, axis=0)
    trues = np.concatenate(trues, axis=0)
    return preds, trues

def main():
    parser = argparse.ArgumentParser(description="Larger Dataset Trainer")
    parser.add_argument('--epochs', type=int, default=5)
    parser.add_argument('--batch-size', type=int, default=16)
    parser.add_argument('--lr', type=float, default=1e-3)
    parser.add_argument('--max-files-per-label', type=int, default=50, help='Maximum files per label to extract')
    parser.add_argument('--extract-dir', type=str, default='./extracted_larger', help='Directory to extract files to')
    parser.add_argument('--skip-extract', action='store_true', help='Skip extraction if files already exist')
    args = parser.parse_args()

    cfg = LargerConfig()
    cfg.epochs = args.epochs
    cfg.batch_size = args.batch_size
    cfg.lr = args.lr

    # Use test set
    test_path = "/Users/justinrui/Desktop/datasets/downloads/490188d4aeb134d26b4d278c3bbf920fcd66ad33a885b55a958560a9bec08c55"

    print("🚀 LARGER DATASET TRAINER")
    print(f"Test set: {test_path}")
    print(f"Extract directory: {args.extract_dir}")
    
    try:
        # Extract files if needed
        if not args.skip_extract or not os.path.exists(args.extract_dir):
            print(f"\n📦 Extracting files...")
            extracted_files = extract_files_to_disk(test_path, args.extract_dir, args.max_files_per_label)
        else:
            print(f"\n📁 Using existing extracted files...")
            extracted_files = get_extracted_files(args.extract_dir)
        
        # Print label distribution
        print("\nLabel distribution in extracted data:")
        label_counts = Counter([label for _, label in extracted_files])
        for label, count in label_counts.items():
            print(f"  {label}: {count}")
        
        # Split into train/val (80/20)
        random.shuffle(extracted_files)
        split_idx = int(0.8 * len(extracted_files))
        train_files = extracted_files[:split_idx]
        val_files = extracted_files[split_idx:]
        
        print(f"\nSplit into {len(train_files)} training and {len(val_files)} validation samples")
        
        # Create datasets
        train_ds = ExtractedDataset(cfg, train_files)
        val_ds = ExtractedDataset(cfg, val_files)

        train_loader = DataLoader(train_ds, batch_size=cfg.batch_size, shuffle=True, num_workers=2, collate_fn=collate_fn)
        val_loader = DataLoader(val_ds, batch_size=cfg.batch_size, shuffle=False, num_workers=2, collate_fn=collate_fn)

        model = CNNLSTMMultiLabel(n_mels=cfg.n_mels, num_labels=len(cfg.label_names)).to(dev)
        loss_fn = nn.BCEWithLogitsLoss()
        optimizer = optim.Adam(model.parameters(), lr=cfg.lr)

        print(f"\n🎯 Training with {len(train_files)} training samples and {len(val_files)} validation samples...")
        best_val_loss = float('inf')
        
        for epoch in range(1, cfg.epochs + 1):
            print(f"\n📊 Epoch {epoch}/{cfg.epochs}")
            
            # Training
            train_loss = train_one_epoch(model, train_loader, optimizer, loss_fn)
            print(f"Training loss: {train_loss:.4f}")
            
            # Validation
            val_preds, val_trues = evaluate(model, val_loader)
            val_loss = nn.BCEWithLogitsLoss()(torch.from_numpy(val_preds), torch.from_numpy(val_trues)).item()
            print(f"Validation loss: {val_loss:.4f}")
            
            # Save best model
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                torch.save(model.state_dict(), 'best_larger_model.pth')
                print("Saved best model!")
            
            # Save epoch model
            torch.save(model.state_dict(), f'larger_model_epoch_{epoch}.pth')
            print(f"Saved model for epoch {epoch}!")
            
            # Clear memory
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        print("\nFinal evaluation...")
        val_preds, val_trues = evaluate(model, val_loader)
        bin_preds = (val_preds >= 0.5).astype(np.int32)
        print(classification_report(val_trues, bin_preds, target_names=cfg.label_names, zero_division=0))

        # Save final model
        torch.save(model.state_dict(), 'final_larger_model.pth')
        print("Final model saved as 'final_larger_model.pth'")
        print("Best model saved as 'best_larger_model.pth'")
        
        # Print dataset statistics
        print(f"\n📈 Dataset Statistics:")
        print(f"Training samples processed: {len(train_files)}")
        print(f"Validation samples processed: {len(val_files)}")
        print(f"Total samples processed: {len(train_files) + len(val_files)}")
        print(f"Labels found: {list(set([label for _, label in extracted_files]))}")
        print("\n✅ SUCCESS: Model trained on larger DreamCatcher dataset!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return

if __name__ == '__main__':
    main() 