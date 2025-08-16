#!/usr/bin/env python3
"""
Simple test script for the data loader.
"""

from data_loader import ApneaDataLoader

def test_data_loader():
    """Test the data loader functionality."""
    print("Testing data loader...")
    
    try:
        # Initialize data loader
        loader = ApneaDataLoader()
        print("✅ Data loader initialized successfully")
        
        # Get statistics
        stats = loader.get_patient_statistics()
        print(f"✅ Dataset statistics: {stats['total_patients']} patients, {stats['total_segments']} total segments")
        
        # Get patient IDs
        patient_ids = loader.get_all_patient_ids()
        print(f"✅ Found {len(patient_ids)} patient IDs")
        
        if patient_ids:
            print(f"   Sample patient IDs: {patient_ids[:5]}")
            
            # Test getting data for first patient
            first_patient = patient_ids[0]
            patient_data = loader.get_patient_data(first_patient)
            if patient_data:
                print(f"✅ Patient {first_patient} data: {len(patient_data['segments'])} segments")
                print(f"   Apnea segments: {patient_data['ap_count']}")
                print(f"   Normal segments: {patient_data['normal_count']}")
        
        print("✅ Data loader test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error in data loader test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_data_loader()
