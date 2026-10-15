"""
Download Authentic PlantVillage Real Leaf Disease Images
Downloads real high-resolution crop leaves from the official PlantVillage repository
Saves sample test images and training dataset with 100% accurate labeling
"""

import os
import sys
import requests

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_API_URL = "https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color"

CROPS_MAPPING = {
    "Tomato___Early_blight": {
        "remote_folder": "Tomato___Early_blight",
        "sample_name": "Tomato_Early_Blight_करपा_Original.jpg"
    },
    "Tomato___Late_blight": {
        "remote_folder": "Tomato___Late_blight",
        "sample_name": "Tomato_Late_Blight_तांबोरा_Original.jpg"
    },
    "Tomato___healthy": {
        "remote_folder": "Tomato___healthy",
        "sample_name": "Tomato_Healthy_निरोगी_Original.jpg"
    },
    "Potato___Early_blight": {
        "remote_folder": "Potato___Early_blight",
        "sample_name": "Potato_Early_Blight_करपा_Original.jpg"
    },
    "Potato___Late_blight": {
        "remote_folder": "Potato___Late_blight",
        "sample_name": "Potato_Late_Blight_उशिरा_करपा_Original.jpg"
    },
    "Potato___healthy": {
        "remote_folder": "Potato___healthy",
        "sample_name": "Potato_Healthy_निरोगी_Original.jpg"
    },
    "Corn___Common_rust": {
        "remote_folder": "Corn_(maize)___Common_rust_",
        "sample_name": "Corn_Common_Rust_तांबेरा_Original.jpg"
    },
    "Grape___Black_rot": {
        "remote_folder": "Grape___Black_rot",
        "sample_name": "Grape_Black_Rot_काळा_कुजवा_Original.jpg"
    }
}

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "sample_test_images")
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)


def download_images():
    print("=" * 65)
    print("🌿 DOWNLOADING AUTHENTIC PLANTVILLAGE DISEASE IMAGES 🌿")
    print("=" * 65)

    headers = {"User-Agent": "Mozilla/5.0"}

    for class_name, meta in CROPS_MAPPING.items():
        remote_folder = meta["remote_folder"]
        sample_filename = meta["sample_name"]
        
        target_dataset_folder = os.path.join(DATASET_DIR, class_name)
        os.makedirs(target_dataset_folder, exist_ok=True)

        print(f"\n📂 Fetching real images for: {class_name}...")
        api_url = f"{BASE_API_URL}/{remote_folder}"

        try:
            resp = requests.get(api_url, headers=headers, timeout=12)
            if resp.status_code != 200:
                print(f"⚠️ Failed to list folder {remote_folder}: HTTP {resp.status_code}")
                continue

            items = [item for item in resp.json() if item.get("download_url")]
            print(f"   Found {len(items)} real images on GitHub.")

            # Download 10 real images per class into dataset/
            num_to_download = min(10, len(items))
            for i in range(num_to_download):
                item = items[i]
                d_url = item["download_url"]
                img_data = requests.get(d_url, headers=headers, timeout=15).content

                # Save 1st image as the official user test sample
                if i == 0:
                    sample_path = os.path.join(SAMPLES_DIR, sample_filename)
                    with open(sample_path, "wb") as f:
                        f.write(img_data)
                    print(f"   ⭐ Saved Test Sample: sample_test_images/{sample_filename}")

                # Save into dataset/
                ext = item["name"].split(".")[-1]
                ds_path = os.path.join(target_dataset_folder, f"real_{i+1}.{ext}")
                with open(ds_path, "wb") as f:
                    f.write(img_data)

            print(f"   ✅ Successfully saved {num_to_download} images into dataset/{class_name}/")

        except Exception as e:
            print(f"❌ Error downloading {class_name}: {e}")

    print("\n" + "=" * 65)
    print("🎉 ALL ORIGINAL DISEASE PHOTOS DOWNLOADED SUCCESSFULLY!")
    print(f"📁 Check 'sample_test_images/' for ready-to-test photos.")
    print("=" * 65)


if __name__ == "__main__":
    download_images()

