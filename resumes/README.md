# Resume PDFs

This directory contains auto-generated PDF resumes that are automatically built via GitHub Actions.

## Files

- `resume_en.pdf` - English version of the resume
- `resume_cn.pdf` - Chinese version of the resume (中文版)

## How it works

1. When you update any JSON content files in `content/` or `content/i18n/en/`, or modify the generator scripts, the GitHub Actions workflow automatically triggers
2. The workflow runs both Python generators (`generate_resume.py` and `generate_resume_cn.py`)
3. It compiles the LaTeX files using xelatex
4. The generated PDFs are automatically committed to this directory
5. The PDFs are then available for download on your GitHub Pages website

## Manual Generation

You can also generate these PDFs manually:

### English Version
```bash
python3 generate_resume.py
xelatex resume.tex
xelatex resume.tex
mv resume.pdf resumes/resume_en.pdf
```

### Chinese Version
```bash
python3 generate_resume_cn.py
xelatex resume_cn.tex
xelatex resume_cn.tex
mv resume_cn.pdf resumes/resume_cn.pdf
```
