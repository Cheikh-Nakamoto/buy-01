import os
import sys

def parse_tree_file(tree_file_path):
    with open(tree_file_path, 'r') as file:
        lines = file.readlines()

    folders = []
    for line in lines:
        cleaned = line.strip()
        if '├──' in cleaned or '└──' in cleaned:
            parts = cleaned.split('──')
            if len(parts) == 2:
                folder = parts[1].strip()
                if folder:
                    folders.append(folder)
    return folders

def create_structure(base_name, folders, root_dir='.'):
    # Créer le dossier racine s’il n’existe pas
    os.makedirs(root_dir, exist_ok=True)

    for folder in folders:
        folder_path = os.path.join(root_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Création du fichier Java : ex. userController.java
        suffix = folder.capitalize()
        file_name = f"{base_name}{suffix}.java"
        file_path = os.path.join(folder_path, file_name)

        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                f.write(f"// Auto-generated: {file_name}\n")
            print(f"✅ Created: {file_path}")
        else:
            print(f"⚠️  File already exists: {file_path}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_structure.py <tree_file.txt> <base_name> <root_directory>")
        sys.exit(1)

    tree_file = sys.argv[1]
    base_name = sys.argv[2]
    root_directory = sys.argv[3]
    
    folders = parse_tree_file(tree_file)
    create_structure(base_name, folders, root_directory)
