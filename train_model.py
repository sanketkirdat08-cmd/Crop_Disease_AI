"""
Crop Disease AI - Model Training Script
Final Year B.Tech (AI & Data Science) Project
Architecture: MobileNetV2 (Transfer Learning) + Fine Tuning
Output: model.h5, classes.json, training_performance.png
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras import layers, models, callbacks
from keras.applications import MobileNetV2
from keras.applications.mobilenet_v2 import preprocess_input

# Configuration Parameters
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.0001
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model.h5")
CLASSES_SAVE_PATH = os.path.join(os.path.dirname(__file__), "classes.json")
CHART_SAVE_PATH = os.path.join(os.path.dirname(__file__), "training_performance.png")


def check_dataset_exists(dataset_dir):
    """
    तपासणी करणे: dataset फोल्डरमध्ये रोगानुसार सब-फोल्डर्स आणि इमेजेस आहेत का?
    """
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir, exist_ok=True)
        return False, []

    # केवळ डिरेक्टरी शोधा
    classes = [
        d for d in os.listdir(dataset_dir)
        if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith(".")
    ]

    # जर डायरेक्ट क्लासेस नसतील तर train/ सबफोल्डर तपासा
    train_sub = os.path.join(dataset_dir, "train")
    if os.path.exists(train_sub) and os.path.isdir(train_sub):
        sub_classes = [
            d for d in os.listdir(train_sub)
            if os.path.isdir(os.path.join(train_sub, d)) and not d.startswith(".")
        ]
        if sub_classes:
            return True, [os.path.join(train_sub, c) for c in sub_classes]

    if not classes:
        return False, []

    return True, classes


def create_demo_dataset_if_empty(dataset_dir):
    """
    जर dataset फोल्डर रिकामे असेल, तर टेस्टिंगसाठी आणि मॉडेल फ्लो तपासण्यासाठी
    डेमो इमेजेस तयार करतो जेणेकरून कोड रन करताना एरर येणार नाही.
    """
    print("=" * 65)
    print("⚠️  'dataset/' फोल्डर रिकामे आहे किंवा त्यात क्लास फोल्डर्स नाहीत.")
    print("💡 Kaggle वरून PlantVillage डेटासेट डाऊनलोड करून याप्रमाणे ठेवा:")
    print("   dataset/")
    print("     ├── Tomato___Early_blight/")
    print("     ├── Tomato___Late_blight/")
    print("     ├── Tomato___healthy/")
    print("     ├── Potato___Early_blight/")
    print("     └── Potato___healthy/")
    print("-" * 65)
    choice = input("👉 टेस्टिंगसाठी 3 डेमो क्लासेस (Synthetic Demo Data) तयार करायचे का? (y/n): ").strip().lower()
    
    if choice == 'y':
        import cv2
        demo_classes = ["Tomato___Early_blight", "Tomato___Late_blight", "Tomato___healthy"]
        print("🌱 डेमो डेटा तयार करत आहे...")
        for c in demo_classes:
            c_path = os.path.join(dataset_dir, c)
            os.makedirs(c_path, exist_ok=True)
            for i in range(25):  # 25 sample images per class
                img = np.zeros((224, 224, 3), dtype=np.uint8)
                # Greenish background simulating leaves
                img[:] = (30, np.random.randint(90, 160), 30)
                if "Early_blight" in c:
                    # Brown concentric spots
                    cv2.circle(img, (112, 112), 40, (20, 50, 120), -1)
                elif "Late_blight" in c:
                    # Dark wet patches
                    cv2.ellipse(img, (112, 112), (60, 30), 45, 0, 360, (10, 30, 40), -1)
                cv2.imwrite(os.path.join(c_path, f"sample_{i}.jpg"), img)
        print("✅ डेमो डेटासेट तयार झाला! (प्रोजेक्ट प्रेझेंटेशनसाठी नंतर ओरिजिनल PlantVillage डेटासेट वापरा)")
        return True
    return False


def build_crop_disease_model(num_classes):
    """
    MobileNetV2 ट्रान्सफर लर्निंग आर्किटेक्चर
    - Pretrained on ImageNet
    - Frozen base initially + fine-tuning
    - Custom Classification Head
    """
    # 1. डेटा ऑगमेंटेशन लेयर्स (रोटेशन, फ्लिप, झूम)
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.1)
    ], name="data_augmentation")

    # 2. बेस मॉडेल (MobileNetV2)
    base_model = MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=(*IMAGE_SIZE, 3)
    )
    base_model.trainable = False  # सुरुवातीला बेस मॉडेलचे वेट्स फ्रीझ ठेवू

    # 3. मॉडेल इनपुट आणि लेयर्स जोडणे
    inputs = layers.Input(shape=(*IMAGE_SIZE, 3), name="input_image")
    x = data_augmentation(inputs)
    x = preprocess_input(x)  # MobileNetV2 साठी नॉर्मलायझेशन [-1, 1]
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3, name="dropout_1")(x)
    x = layers.Dense(256, activation="relu", name="dense_features")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.2, name="dropout_2")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="disease_prediction")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="CropDisease_MobileNetV2")
    return model, base_model


def save_training_plots(history, output_path):
    """
    ट्रेनिंग आणि व्हॅलिडेशन अचूकतेचा आलेख (Plot) सेव्ह करणे
    (हा आलेख तुमच्या B.Tech प्रोजेक्ट रिपोर्टमध्ये लावता येईल)
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        acc = history.history.get("accuracy", [])
        val_acc = history.history.get("val_accuracy", [])
        loss = history.history.get("loss", [])
        val_loss = history.history.get("val_loss", [])
        epochs_range = range(len(acc))

        plt.figure(figsize=(12, 5))

        # Accuracy Subplot
        plt.subplot(1, 2, 1)
        plt.plot(epochs_range, acc, label="Training Accuracy", color="#00ffcc", linewidth=2)
        plt.plot(epochs_range, val_acc, label="Validation Accuracy", color="#ff007f", linewidth=2)
        plt.title("Model Accuracy Curve", fontsize=13, fontweight="bold")
        plt.xlabel("Epochs")
        plt.ylabel("Accuracy")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.legend(loc="lower right")

        # Loss Subplot
        plt.subplot(1, 2, 2)
        plt.plot(epochs_range, loss, label="Training Loss", color="#00ffcc", linewidth=2)
        plt.plot(epochs_range, val_loss, label="Validation Loss", color="#ff007f", linewidth=2)
        plt.title("Model Loss Curve", fontsize=13, fontweight="bold")
        plt.xlabel("Epochs")
        plt.ylabel("Loss")
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.legend(loc="upper right")

        plt.tight_layout()
        plt.savefig(output_path, dpi=300)
        plt.close()
        print(f"📊 ट्रेनिंग परफॉर्मन्स आलेख '{output_path}' मध्ये सेव्ह झाला.")
    except Exception as e:
        print(f"⚠️ चार्ट सेव्ह करताना अडचण आली (Optional): {e}")


def main():
    print("=" * 65)
    print("🌾 CROP DISEASE AI - MODEL TRAINING PIPELINE 🌾")
    print("=" * 65)

    # १. डेटासेट तपासणी
    has_data, classes = check_dataset_exists(DATASET_DIR)
    if not has_data:
        success = create_demo_dataset_if_empty(DATASET_DIR)
        if not success:
            print("❌ कृपया 'dataset/' फोल्डरमध्ये फोटो टाका आणि पुन्हा रन करा.")
            return

    # २. Keras Dataset लोडर (Train: 80%, Validation: 20%)
    print("\n📂 डेटासेट लोड करत आहे...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"\n✅ एकूण सापडलेले रोग/क्लासेस: {num_classes}")
    for idx, c in enumerate(class_names):
        print(f"   [{idx}] {c}")

    # ३. क्लास इंडेक्स सेव्ह करणे (app.py मध्ये वापरण्यासाठी)
    with open(CLASSES_SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=4, ensure_ascii=False)
    print(f"💾 क्लास यादी '{CLASSES_SAVE_PATH}' मध्ये सुरक्षित सेव्ह झाली.")

    # ४. कॅशिंग आणि प्रीफेचिंग (वेगवान ट्रेनिंगसाठी)
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # ५. मॉडेल तयार करणे
    print("\n🧠 MobileNetV2 मॉडेल तयार करत आहे...")
    model, base_model = build_crop_disease_model(num_classes)

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    # ६. ट्रेनिंग कॉलबॅक्स (Callbacks)
    training_callbacks = [
        callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=3,
            min_lr=1e-6,
            verbose=1
        ),
        callbacks.ModelCheckpoint(
            filepath=MODEL_SAVE_PATH,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        )
    ]

    # ७. मॉडेल ट्रेनिंग सुरू करणे
    print(f"\n🚀 मॉडेल ट्रेनिंग सुरू होत आहे ({EPOCHS} Epochs)...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=training_callbacks
    )

    # ८. मॉडेल पूर्ण सेव्ह करणे
    model.save(MODEL_SAVE_PATH)
    print("=" * 65)
    print(f"🎉 मॉडेल यशस्वीरीत्या सेव्ह झाले: {MODEL_SAVE_PATH}")

    # ९. आलेख काढणे
    save_training_plots(history, CHART_SAVE_PATH)
    print("🏁 ट्रेनिंग यशस्वीरीत्या पूर्ण झाली!")
    print("=" * 65)


if __name__ == "__main__":
    main()

