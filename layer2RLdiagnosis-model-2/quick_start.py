#!/usr/bin/env python3
"""
Quick Start script for the RL-based Sleep Apnea Detection system.
Provides a simple interface to get started quickly.
"""

import os
import sys
from typing import Optional


def print_banner():
    """Print the system banner."""
    print("=" * 70)
    print("🌙 SLEEP APNEA DETECTION using REINFORCEMENT LEARNING 🌙")
    print("=" * 70)
    print("🎯 Layer 2: Sleep Disorder Diagnosis (Apnea Detection)")
    print("🤖 RL Agent with Confidence-Aware Rewards")
    print("📊 ECE-Calibrated Predictions + Severity Assessment")
    print("=" * 70)


def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'torch', 'torchaudio', 'gymnasium', 'stable_baselines3',
        'librosa', 'numpy', 'matplotlib', 'seaborn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("💡 Install missing packages with: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed!")
    return True


def check_files():
    """Check if required files are present."""
    print("\n📁 Checking project files...")
    
    required_files = [
        'main.py', 'apnea_detection_env.py', 'rl_agent.py',
        'data_loader.py', 'test_custom_audio.py', 'demo.py'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - MISSING")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ Missing files: {', '.join(missing_files)}")
        return False
    
    print("✅ All project files are present!")
    return True


def show_menu():
    """Show the main menu."""
    print("\n" + "=" * 50)
    print("🚀 QUICK START MENU")
    print("=" * 50)
    print("1. 🎬 Run Demo (No training required)")
    print("2. 🚀 Start Full Training Pipeline")
    print("3. 🧪 Test on Custom Audio")
    print("4. 📊 View Dataset Statistics")
    print("5. 🔧 Install Dependencies")
    print("6. 📚 View Documentation")
    print("7. 🚪 Exit")
    print("=" * 50)


def run_demo():
    """Run the demo script."""
    print("\n🎬 Starting Demo...")
    try:
        from demo import main as demo_main
        demo_main()
    except Exception as e:
        print(f"❌ Error running demo: {e}")
        print("💡 Make sure all dependencies are installed")


def start_training():
    """Start the full training pipeline."""
    print("\n🚀 Starting Full Training Pipeline...")
    print("⚠️  This will download the dataset and train the RL agent")
    print("⏱️  Estimated time: 30-60 minutes (depending on hardware)")
    
    response = input("\n🤔 Continue with training? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        try:
            from main import main as training_main
            training_main()
        except Exception as e:
            print(f"❌ Error during training: {e}")
            print("💡 Check the error message and ensure all dependencies are installed")
    else:
        print("⏹️ Training cancelled")


def test_custom_audio():
    """Test on custom audio."""
    print("\n🧪 Custom Audio Testing...")
    
    # Check if apnea.mp3 exists
    if os.path.exists("apnea.mp3"):
        print("✅ Found apnea.mp3 - testing on this file")
        try:
            from test_custom_audio import main as test_main
            test_main()
        except Exception as e:
            print(f"❌ Error during testing: {e}")
            print("💡 Make sure the model is trained first")
    else:
        print("❌ No custom audio file found")
        print("💡 Place your .mp3 file in the project directory")
        print("💡 Or run the training pipeline first to test on the dataset")


def view_dataset_stats():
    """View dataset statistics."""
    print("\n📊 Dataset Statistics...")
    try:
        from data_loader import ApneaDataLoader
        
        # Initialize data loader (this will download dataset if needed)
        print("📥 Loading dataset (this may take a few minutes on first run)...")
        data_loader = ApneaDataLoader()
        
        # Get statistics
        stats = data_loader.get_patient_statistics()
        
        print("\n📊 DATASET OVERVIEW:")
        print(f"   Total Patients: {stats['total_patients']}")
        print(f"   Total Segments: {stats['total_segments']}")
        print(f"   Apnea Segments: {stats['total_apnea_segments']}")
        print(f"   Normal Segments: {stats['total_normal_segments']}")
        
        # Show patient details
        print(f"\n👥 PATIENT DETAILS:")
        for patient_id, details in stats['patient_details'].items():
            print(f"   {patient_id}: {details['total_segments']} segments "
                  f"({details['apnea_segments']} apnea, {details['normal_segments']} normal)")
        
        # Visualize distribution
        print("\n📈 Generating visualization...")
        data_loader.visualize_patient_distribution(save_path="dataset_overview.png")
        
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        print("💡 Make sure you have internet connection and kaggle credentials configured")


def install_dependencies():
    """Install dependencies."""
    print("\n🔧 Installing Dependencies...")
    
    try:
        import subprocess
        import sys
        
        print("📦 Installing from requirements.txt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        print("💡 Try installing manually: pip install -r requirements.txt")


def view_documentation():
    """View documentation."""
    print("\n📚 Documentation...")
    
    if os.path.exists("README.md"):
        print("📖 README.md found. Opening...")
        try:
            import subprocess
            import platform
            
            if platform.system() == "Windows":
                os.startfile("README.md")
            elif platform.system() == "Darwin":  # macOS
                subprocess.call(["open", "README.md"])
            else:  # Linux
                subprocess.call(["xdg-open", "README.md"])
                
            print("✅ README.md opened in default application")
        except Exception as e:
            print(f"❌ Error opening README.md: {e}")
            print("💡 Open README.md manually to view documentation")
    else:
        print("❌ README.md not found")
        print("💡 Check the project directory for documentation files")


def main():
    """Main function for quick start."""
    print_banner()
    
    # Check system status
    if not check_dependencies():
        print("\n❌ System check failed. Please install missing dependencies.")
        response = input("🤔 Install dependencies now? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            install_dependencies()
            if not check_dependencies():
                print("❌ Still missing dependencies. Please install manually.")
                return
        else:
            print("💡 Please install dependencies manually before continuing.")
            return
    
    if not check_files():
        print("\n❌ Project files are missing. Please check the project directory.")
        return
    
    print("\n✅ System check passed! Ready to go!")
    
    # Main menu loop
    while True:
        show_menu()
        
        try:
            choice = input("\n🎯 Enter your choice (1-7): ").strip()
            
            if choice == "1":
                run_demo()
            elif choice == "2":
                start_training()
            elif choice == "3":
                test_custom_audio()
            elif choice == "4":
                view_dataset_stats()
            elif choice == "5":
                install_dependencies()
            elif choice == "6":
                view_documentation()
            elif choice == "7":
                print("\n👋 Goodbye! Sleep well! 😴")
                break
            else:
                print("❌ Invalid choice. Please enter a number between 1-7.")
            
            if choice in ["1", "2", "3", "4"]:
                input("\n⏸️ Press Enter to continue...")
                
        except KeyboardInterrupt:
            print("\n\n⏹️ Interrupted by user")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            input("\n⏸️ Press Enter to continue...")


if __name__ == "__main__":
    main()
