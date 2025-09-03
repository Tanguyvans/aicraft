# Vast.AI Essential Commands

## Setup

```bash
pip install vastai
vastai set api-key YOUR_API_KEY_HERE
```

## Basic Workflow

### 1. Search for instances

```bash
vastai search offers 'gpu_name=RTX_4090 reliability > 0.99' -o 'dph+'
```

### 2. Create instance

```bash
vastai create instance OFFER_ID --image pytorch/pytorch:latest --disk 30 --ssh --direct
```

### 3. Check status

```bash
vastai show instances
vastai show instance INSTANCE_ID
```

### 4. Get SSH connection

```bash
vastai ssh-url INSTANCE_ID
```

### 5. Connect via SSH

```bash
ssh -p PORT root@HOST
```

### 6. Add SSH key to agent (if permission denied)

```bash
ssh-add ~/.ssh/id_ed25519
```

### 7. Clean up

```bash
vastai destroy instance INSTANCE_ID
```

## Deploy Code

### Git Repository

```bash
# Inside instance
git clone https://github.com/user/repo.git
cd repo
pip install -r requirements.txt
python main.py
```

### Local Files

```bash
# Local machine
tar -czf project.tar.gz ./your-folder
scp -P PORT project.tar.gz root@HOST:/workspace/

# Inside instance
tar -xzf /workspace/project.tar.gz
cd your-folder
python script.py
```

## Notes

- Instance status shows "created" when ready to SSH
- Use `ssh-add` if you get "Permission denied (publickey)"
- Always destroy instances when done to avoid charges
