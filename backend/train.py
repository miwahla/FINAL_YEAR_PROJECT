"""
LeafEye Disease Detection — EfficientNet-B3 Fine-tuning
Run: python train.py
Output: efficientnet_leafeye.pt + class_names.json
"""

import os
import json
import copy
import time
from pathlib import Path
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler, random_split
from torchvision import models, transforms

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────
BASE = Path("E:/haider/FCCU/FCCU/semester 8/fyp2/LeafEye/LeafEye/datasets")
OUTPUT_DIR = Path("E:/haider/FCCU/FCCU/semester 8/fyp2/FINAL_YEAR_PROJECT/backend")

BATCH_SIZE   = 64
IMAGE_SIZE   = 224
EPOCHS       = 40
UNFREEZE_AT  = 8      # unfreeze base layers after this many epochs
LR           = 1e-4
VAL_SPLIT    = 0.15
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# ──────────────────────────────────────────────
# DATASET SOURCES
# Each entry: (crop_label, class_label, folder_path)
# Images are collected recursively from folder_path
# ──────────────────────────────────────────────
SOURCES = [

    # ── COTTON ──────────────────────────────────
    ("cotton", "bacterial_blight",        BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Bacterial Blight"),
    ("cotton", "curl_virus",              BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Curl Virus"),
    ("cotton", "healthy",                 BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Healthy Leaf"),
    ("cotton", "herbicide_damage",        BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Herbicide Growth Damage"),
    ("cotton", "leaf_hopper_jassids",     BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Leaf Hopper Jassids"),
    ("cotton", "leaf_reddening",          BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Leaf Redding"),
    ("cotton", "leaf_variegation",        BASE / "cotton/cotton1/SAR-CLD-2024 A Comprehensive Dataset for Cotton Leaf Disease Detection/Original Dataset/Original Dataset/Leaf Variegation"),

    # ── MAIZE ───────────────────────────────────
    ("maize", "fungal_leaf",              BASE / "maize/maize1/PlantCity A Comprehensive Image Based on Multi Cro/Images/train/train/Corn Fungal leaf"),
    ("maize", "healthy",                  BASE / "maize/maize1/PlantCity A Comprehensive Image Based on Multi Cro/Images/train/train/Corn Normal leaf"),
    ("maize", "gray_leaf_spot",           BASE / "maize/maize1/PlantCity A Comprehensive Image Based on Multi Cro/Images/train/train/Corn gray leaf spot"),
    ("maize", "holcus_leaf_spot",         BASE / "maize/maize1/PlantCity A Comprehensive Image Based on Multi Cro/Images/train/train/Corn holcus_ leaf spot"),
    ("maize", "abiotic_disease",          BASE / "maize/from_tom2024/catA/maize_diseases/Abiotic_disease-D"),
    ("maize", "curvularia",               BASE / "maize/from_tom2024/catA/maize_diseases/Curvularia-D"),
    ("maize", "helminthosporiosis",       BASE / "maize/from_tom2024/catA/maize_diseases/Helminthosporiosis-D"),
    ("maize", "rust",                     BASE / "maize/from_tom2024/catA/maize_diseases/Rust-D"),
    ("maize", "stripe_disease",           BASE / "maize/from_tom2024/catA/maize_diseases/Stripe-D"),
    ("maize", "virosis",                  BASE / "maize/from_tom2024/catA/maize_diseases/Virosis-D"),

    # ── ONION ───────────────────────────────────
    ("onion", "iris_yellow_virus",        BASE / "onion/Onion1/Onion dataset/onion dataset resized/onion dataset resized/Iris yellow virus"),
    ("onion", "stemphylium_blight",       BASE / "onion/Onion1/Onion dataset/onion dataset resized/onion dataset resized/Stemphylium leaf blight and collectrichum leaf blight"),
    ("onion", "healthy",                  BASE / "onion/Onion1/Onion dataset/onion dataset resized/onion dataset resized/healthy"),
    ("onion", "purple_blotch",            BASE / "onion/Onion1/Onion dataset/onion dataset resized/onion dataset resized/purple blotch"),
    ("onion", "alternaria",               BASE / "onion/from_tom2024/catA/onion_diseases/Alternaria_D"),
    ("onion", "bulb_blight",              BASE / "onion/from_tom2024/catA/onion_diseases/Bulb_blight-D"),
    ("onion", "fusarium",                 BASE / "onion/from_tom2024/catA/onion_diseases/Fusarium-D"),
    ("onion", "virosis",                  BASE / "onion/from_tom2024/catA/onion_diseases/Virosis-D"),

    # ── POTATO ──────────────────────────────────
    ("potato", "black_scurf",             BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Black Scurf"),
    ("potato", "blackleg",                BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Blackleg"),
    ("potato", "blackspot_bruising",      BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Blackspot Bruising"),
    ("potato", "brown_rot",               BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Brown Rot"),
    ("potato", "common_scab",             BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Common Scab"),
    ("potato", "dry_rot",                 BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Dry Rot"),
    ("potato", "healthy",                 BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Healthy Potatoes"),
    ("potato", "pink_rot",                BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Pink Rot"),
    ("potato", "soft_rot",                BASE / "potato/potato1/PotatoCare Deep learning based potato disease  dataset/Potato Disease Dataset-20250303T183921Z-001/Potato Disease Dataset/Soft Rot"),

    # ── RICE ────────────────────────────────────
    ("rice", "bacterial_leaf_blight",     BASE / "rice/rice1/Rice Leaf and Crop Disease Detection Dataset/Rice Leaf and Crop Disease Detection Dataset/Bacterial Leaf Blight"),
    ("rice", "healthy",                   BASE / "rice/rice1/Rice Leaf and Crop Disease Detection Dataset/Rice Leaf and Crop Disease Detection Dataset/Healthy _leaf"),
    ("rice", "rice_blast",                BASE / "rice/rice1/Rice Leaf and Crop Disease Detection Dataset/Rice Leaf and Crop Disease Detection Dataset/Rice Blast"),
    ("rice", "tungro",                    BASE / "rice/rice1/Rice Leaf and Crop Disease Detection Dataset/Rice Leaf and Crop Disease Detection Dataset/Tungro"),

    # ── SUGARCANE ───────────────────────────────
    ("sugarcane", "banded_chlorosis",     BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Banded Chlorosis"),
    ("sugarcane", "brown_spot",           BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Brown Spot"),
    ("sugarcane", "brown_rust",           BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/BrownRust"),
    ("sugarcane", "grassy_shoot",         BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Grassy shoot"),
    ("sugarcane", "pokkah_boeng",         BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Pokkah Boeng"),
    ("sugarcane", "sett_rot",             BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Sett Rot"),
    ("sugarcane", "viral_disease",        BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Viral Disease"),
    ("sugarcane", "yellow_leaf",          BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/Yellow Leaf"),
    ("sugarcane", "smut",                 BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Diseases/Diseases/smut"),
    ("sugarcane", "healthy",              BASE / "sugarcane/Sugarcane1/Sugarcane Leaf Image Dataset/Healthy Leaves"),

    # ── SUNFLOWER ───────────────────────────────
    ("sunflower", "downy_mildew",         BASE / "sunflower/sunflower1/b83hmrzth8-1/Original Image/Original Image/Downy mildew"),
    ("sunflower", "healthy",              BASE / "sunflower/sunflower1/b83hmrzth8-1/Original Image/Original Image/Fresh Leaf"),
    ("sunflower", "gray_mold",            BASE / "sunflower/sunflower1/b83hmrzth8-1/Original Image/Original Image/Gray mold"),
    ("sunflower", "leaf_scars",           BASE / "sunflower/sunflower1/b83hmrzth8-1/Original Image/Original Image/Leaf scars"),

    # ── TOMATO ──────────────────────────────────
    ("tomato", "bacterial_disease",       BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/Bacterial_floundering_d"),
    ("tomato", "blossom_end_rot",         BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/Blossom_end_rot_d"),
    ("tomato", "mite",                    BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/Mite_d"),
    ("tomato", "alternaria",              BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/alternaria_d"),
    ("tomato", "fusarium",                BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/fusarium_d"),
    ("tomato", "healthy",                 BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/healthy_leaf"),
    ("tomato", "late_blight",             BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/tomato_late_blight_d"),
    ("tomato", "virosis",                 BASE / "tomato/tomato1/TOM2024/CATEGORY A/CATA-English/tomato_diseases/virosis_d"),
    ("tomato", "bacterial_spot",          BASE / "tomato/from_plantcity/tomato_bacterial_spot"),
    ("tomato", "early_blight",            BASE / "tomato/from_plantcity/tomato_early_blight"),
    ("tomato", "late_blight",             BASE / "tomato/from_plantcity/tomato_late_blight"),
    ("tomato", "leaf_curl",               BASE / "tomato/from_plantcity/tomato_leaf_curl"),
    ("tomato", "leaf_mold",               BASE / "tomato/from_plantcity/tomato_leaf_mold"),
    ("tomato", "septoria_leaf_spot",      BASE / "tomato/from_plantcity/tomato_septoria_leaf"),

    # ── WHEAT ───────────────────────────────────
    ("wheat", "healthy",                  BASE / "wheat/wheat2/wheat_leaf/Healthy"),
    ("wheat", "septoria",                 BASE / "wheat/wheat2/wheat_leaf/septoria"),
    ("wheat", "stripe_rust",              BASE / "wheat/wheat2/wheat_leaf/stripe_rust"),
    ("wheat", "leaf_rust",                BASE / "wheat/wheat1/WheatLeafRust/WheatLeafRust"),
]


# ──────────────────────────────────────────────
# COLLECT ALL IMAGE PATHS
# ──────────────────────────────────────────────
def collect_images(folder: Path):
    images = []
    if not folder.exists():
        print(f"  [SKIP] Not found: {folder}")
        return images
    for p in folder.rglob("*"):
        if p.suffix.lower() in IMG_EXTS:
            images.append(p)
    return images


def build_dataset():
    samples = []
    class_names = []

    print("Scanning dataset sources...")
    for crop, disease, folder in SOURCES:
        label = f"{crop}__{disease}"
        if label not in class_names:
            class_names.append(label)
        idx = class_names.index(label)
        imgs = collect_images(folder)
        print(f"  {label}: {len(imgs)} images")
        for img_path in imgs:
            samples.append((img_path, idx))

    print(f"\nTotal: {len(samples)} images across {len(class_names)} classes")
    return samples, class_names


# ──────────────────────────────────────────────
# WEIGHTED SAMPLER — fixes class imbalance
# ──────────────────────────────────────────────
def make_sampler(samples, num_classes):
    labels = [label for _, label in samples]
    class_counts = torch.zeros(num_classes)
    for l in labels:
        class_counts[l] += 1
    # avoid division by zero for missing classes
    class_counts = class_counts.clamp(min=1)
    weights_per_class = 1.0 / class_counts
    sample_weights = torch.tensor([weights_per_class[l] for l in labels])
    return WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)


# ──────────────────────────────────────────────
# PYTORCH DATASET
# ──────────────────────────────────────────────
class LeafEyeDataset(Dataset):
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            img = Image.open(path).convert("RGB")
        except Exception:
            img = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE))
        if self.transform:
            img = self.transform(img)
        return img, label


# ──────────────────────────────────────────────
# TRANSFORMS
# ──────────────────────────────────────────────
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(30),
    transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.3, hue=0.05),
    transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
    transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
    transforms.RandomGrayscale(p=0.05),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    transforms.RandomErasing(p=0.1, scale=(0.02, 0.1)),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


# ──────────────────────────────────────────────
# MODEL — EfficientNet-B3
# ──────────────────────────────────────────────
def build_model(num_classes):
    model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
    for param in model.parameters():
        param.requires_grad = False
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, num_classes),
    )
    return model


# ──────────────────────────────────────────────
# TEMPERATURE SCALING — calibrates confidence %
# ──────────────────────────────────────────────
def calibrate_temperature(model, val_loader):
    print("\nCalibrating confidence scores (temperature scaling)...")
    model.eval()
    logits_list, labels_list = [], []
    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs = imgs.to(DEVICE)
            logits_list.append(model(imgs).cpu())
            labels_list.append(labels)

    logits_all = torch.cat(logits_list)
    labels_all = torch.cat(labels_list)

    temperature = nn.Parameter(torch.ones(1) * 1.5)
    t_optimizer = optim.LBFGS([temperature], lr=0.01, max_iter=200)

    def eval_t():
        t_optimizer.zero_grad()
        loss = nn.CrossEntropyLoss()(logits_all / temperature, labels_all)
        loss.backward()
        return loss

    t_optimizer.step(eval_t)
    t_val = temperature.item()
    print(f"Optimal temperature: {t_val:.4f}")
    return t_val


# ──────────────────────────────────────────────
# TRAINING LOOP
# ──────────────────────────────────────────────
def train():
    print(f"Device: {DEVICE}\n")

    samples, class_names = build_dataset()
    num_classes = len(class_names)

    val_size = int(len(samples) * VAL_SPLIT)
    train_size = len(samples) - val_size
    all_dataset = LeafEyeDataset(samples)
    train_subset, val_subset = random_split(all_dataset, [train_size, val_size])

    train_samples = [samples[i] for i in train_subset.indices]
    val_samples   = [samples[i] for i in val_subset.indices]

    train_dataset = LeafEyeDataset(train_samples, train_transform)
    val_dataset   = LeafEyeDataset(val_samples,   val_transform)

    sampler = make_sampler(train_samples, num_classes)
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, sampler=sampler,
                              num_workers=0, pin_memory=True)
    val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=0, pin_memory=True)

    print(f"Train: {len(train_dataset)} | Val: {len(val_dataset)} | Classes: {num_classes}\n")

    model = build_model(num_classes).to(DEVICE)

    criterion = nn.CrossEntropyLoss()

    # Phase 1: classifier head only
    optimizer = optim.AdamW(model.classifier.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=UNFREEZE_AT, eta_min=1e-6)

    best_acc     = 0.0
    best_weights = copy.deepcopy(model.state_dict())

    for epoch in range(1, EPOCHS + 1):

        # Phase 2: unfreeze all layers after UNFREEZE_AT epochs
        if epoch == UNFREEZE_AT + 1:
            print("Unfreezing base layers for fine-tuning...")
            for param in model.parameters():
                param.requires_grad = True
            optimizer = optim.AdamW(model.parameters(), lr=LR * 0.1, weight_decay=1e-4)
            scheduler = optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=EPOCHS - UNFREEZE_AT, eta_min=1e-7
            )

        # ── Train ──
        model.train()
        train_loss, train_correct = 0.0, 0
        t0 = time.time()
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss    += loss.item() * imgs.size(0)
            train_correct += (outputs.argmax(1) == labels).sum().item()
        scheduler.step()

        # ── Validate ──
        model.eval()
        val_loss, val_correct = 0.0, 0
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
                outputs = model(imgs)
                loss = criterion(outputs, labels)
                val_loss    += loss.item() * imgs.size(0)
                val_correct += (outputs.argmax(1) == labels).sum().item()

        train_acc = train_correct / len(train_dataset)
        val_acc   = val_correct   / len(val_dataset)
        elapsed   = time.time() - t0
        lr_now    = optimizer.param_groups[0]["lr"]

        print(f"Epoch {epoch:02d}/{EPOCHS} | "
              f"Train Loss: {train_loss/len(train_dataset):.4f} Acc: {train_acc:.3f} | "
              f"Val Loss: {val_loss/len(val_dataset):.4f} Acc: {val_acc:.3f} | "
              f"LR: {lr_now:.2e} | Time: {elapsed:.1f}s")

        if val_acc > best_acc:
            best_acc = val_acc
            best_weights = copy.deepcopy(model.state_dict())
            print(f"  >> New best val accuracy: {best_acc:.3f}")

    # ── Calibrate & Save ──
    model.load_state_dict(best_weights)
    temperature = calibrate_temperature(model, val_loader)

    model_path = OUTPUT_DIR / "efficientnet_leafeye_b3.pt"
    torch.save({"state_dict": best_weights, "temperature": temperature}, model_path)
    print(f"\nModel saved → {model_path}")

    class_path = OUTPUT_DIR / "class_names.json"
    with open(class_path, "w") as f:
        json.dump(class_names, f, indent=2)
    print(f"Class names saved → {class_path}")
    print(f"\nBest val accuracy: {best_acc:.3f}")
    print(f"Total classes: {num_classes}")


if __name__ == "__main__":
    train()
