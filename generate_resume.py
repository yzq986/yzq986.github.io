#!/usr/bin/env python3
"""
Resume Generator from JSON to LaTeX
Reads JSON data and generates a professional LaTeX resume
"""

import json
import os
from pathlib import Path


class ResumeGenerator:
    def __init__(self, base_path: str = "content/i18n/en"):
        self.base_path = Path(base_path)
        self.data = {}

    def load_data(self):
        """Load all JSON data files"""
        # Load basic info
        with open(self.base_path / "basic.json", 'r', encoding='utf-8') as f:
            self.data['basic'] = json.load(f)

        # Load awards
        with open(self.base_path / "awards.json", 'r', encoding='utf-8') as f:
            self.data['awards'] = json.load(f)

        # Load social/activities
        with open(self.base_path / "social.json", 'r', encoding='utf-8') as f:
            self.data['social'] = json.load(f)

        # Load all experience files in specific order
        self.data['experiences'] = []
        experience_dir = self.base_path / "experience"
        experience_order = ['cex.json', 'tiktok.json', 'shopee.json', 'wechat.json',
                           'google.json', 'bigo.json', 'polyu.json']

        if experience_dir.exists():
            for exp_filename in experience_order:
                exp_file = experience_dir / exp_filename
                if exp_file.exists():
                    with open(exp_file, 'r', encoding='utf-8') as f:
                        self.data['experiences'].append(json.load(f))

        # Load projects if exists
        projects_file = self.base_path / "projects" / "school.json"
        if projects_file.exists():
            with open(projects_file, 'r', encoding='utf-8') as f:
                self.data['projects'] = json.load(f)

    def escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters"""
        replacements = {
            '&': r'\&',
            '%': r'\%',
            '$': r'\$',
            '#': r'\#',
            '_': r'\_',
            '{': r'\{',
            '}': r'\}',
            '~': r'\textasciitilde{}',
            '^': r'\^{}',
        }
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
        return text

    def generate_header(self) -> str:
        """Generate LaTeX header section"""
        basic = self.data['basic']['basicInfo']
        name = self.escape_latex(basic['name'])

        # Get contact info
        email = basic['contacts']['email'][0]['value'] if basic['contacts']['email'] else ""
        phone = basic['contacts']['phone'][0]['value'] if basic['contacts']['phone'] else ""

        header = r"""\begin{center}
    {\huge """ + name + r"""} \\ \vspace{2pt}
    {""" + self.escape_latex(phone) + r"""}
    \small{-}
    \href{mailto:""" + email + r"""}{\color{blue}{""" + email + r"""}}
    \small{-}
    \href{https://yzq986.github.io}{\color{blue}{yzq986.github.io}}
    \vspace{-7pt}
\end{center}
"""
        return header

    def generate_education(self) -> str:
        """Generate education section"""
        edu = self.data['basic']['education']

        section = r"""%-----------EDUCATION-----------
\section{\color{airforceblue}EDUCATION}
  \resumeSubHeadingListStart
    \resumeSubheading
      {""" + self.escape_latex(edu['university']) + r"""}{""" + self.escape_latex(edu['period']) + r"""}
      {""" + self.escape_latex(edu['degree']) + r"""}{GPA: """ + self.escape_latex(edu['gpa']) + r"""}
  \resumeSubHeadingListEnd
  \vspace{-10pt}
"""
        return section

    def generate_experience(self) -> str:
        """Generate work experience section"""
        section = r"""%-----------EXPERIENCE-----------
\section{\color{airforceblue}WORK EXPERIENCE}
  \resumeSubHeadingListStart
"""

        for exp in self.data['experiences']:
            company = self.escape_latex(exp['company'])
            period = self.escape_latex(exp['period'])
            role = self.escape_latex(exp.get('role', ''))
            description = self.escape_latex(exp.get('description', ''))

            section += r"""
    \resumeSubheading
      {""" + company + r"""}{}
      {""" + role + r"""}{""" + period + r"""}
      \resumeItemListStart
"""

            # Add main description
            if description:
                section += r"            \resumeItem{\normalsize{" + description + r"}}" + "\n"
                section += r"            \vspace{2pt}" + "\n"

            # Add project details with better formatting
            if 'projects' in exp:
                for project in exp['projects']:
                    project_name = self.escape_latex(project['name'])
                    # Project name as bold header with bullet
                    section += r"            \resumeItem{\normalsize{\textbf{" + project_name + r"}}}" + "\n"

                    if 'details' in project:
                        # Start nested itemize for second-level bullets
                        section += r"            \begin{itemize}[leftmargin=0.2in]" + "\n"
                        for detail in project['details']:
                            content = self.escape_latex(detail['content'])
                            # Project details with second-level bullet
                            section += r"                \item \normalsize{" + content + r"}" + "\n"
                        section += r"            \end{itemize}" + "\n"

                    # Add spacing between projects
                    section += r"            \vspace{1pt}" + "\n"

            section += r"""      \resumeItemListEnd
"""

        section += r"""  \resumeSubHeadingListEnd
\vspace{-12pt}
"""
        return section

    def generate_awards(self) -> str:
        """Generate awards/publications section"""
        section = r"""%-----------AWARDS & HONORS---------------
\section{\color{airforceblue}AWARDS \& HONORS}

  \resumeItemListStart
"""

        for award in self.data['awards']['awards']:
            title = self.escape_latex(award['title'])
            description = self.escape_latex(award['description'])
            date = self.escape_latex(award['date'])

            section += r"    \resumeItem{\normalsize{\textbf{" + title + r"} --- " + description + r" (" + date + r")}}" + "\n"
            section += r"    \vspace{-5pt}" + "\n"

        section += r"""  \resumeItemListEnd

\vspace{-8pt}
"""
        return section

    def generate_activities(self) -> str:
        """Generate extracurricular activities section"""
        if 'social' not in self.data or 'activities' not in self.data['social']:
            return ""

        section = r"""%-----------EXTRACURRICULAR---------------
\section{\color{airforceblue}EXTRACURRICULAR ACTIVITIES}

      \resumeItemListStart
"""

        for activity in self.data['social']['activities']:
            org = self.escape_latex(activity['organization'])
            role = self.escape_latex(activity['role'])
            period = self.escape_latex(activity['period'])
            description = self.escape_latex(activity.get('description', ''))

            section += r"        \resumeItem{\normalsize{\textbf{" + role + r"} in " + org + r" --- {" + period + r"} }}" + "\n"
            if description:
                section += r"        \resumeItem{\normalsize{" + description + r"}}" + "\n"
            section += r"        \vspace{-5pt}" + "\n"

        section += r"""      \resumeItemListEnd

\vspace{-12pt}
"""
        return section

    def generate_skills(self) -> str:
        """Generate technical skills section (placeholder)"""
        section = r"""%-----------PROGRAMMING SKILLS-----------
\section{\color{airforceblue}TECHNICAL SKILLS}
 \begin{itemize}[leftmargin=0in, label={}]
    \small{\item{
     \textbf{\normalsize{Algorithms:}}{ \normalsize{Recommendation Systems Architecture, Model Optimization, Deep Learning}} \\
     \textbf{\normalsize{Programming Languages:}}{ \normalsize{C++, Python, Java}} \\
     \textbf{\normalsize{Machine Learning:}}{ \normalsize{TensorFlow, PyTorch}} \\
     \textbf{\normalsize{Data \& Engineering:}}{ \normalsize{Spark, Hadoop, Docker, Kubernetes, AWS, Git}}
     }}
 \end{itemize}
 \vspace{-16pt}
"""
        return section

    def generate_latex_preamble(self) -> str:
        """Generate LaTeX document preamble"""
        return r"""%-------------------------
% Resume in Latex (English Version)
% Auto-generated from JSON data
% Compile with: pdflatex
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{fontawesome5}
\usepackage{multicol}
\usepackage{graphicx}
\setlength{\multicolsep}{-3.0pt}
\setlength{\columnsep}{-1pt}
% glyphtounicode removed for better compatibility across different LaTeX distributions

\RequirePackage{tikz}
\RequirePackage{xcolor}

\definecolor{cvblue}{HTML}{0E5484}
\definecolor{black}{HTML}{130810}
\definecolor{darkcolor}{HTML}{0F4539}
\definecolor{cvgreen}{HTML}{3BD80D}
\definecolor{taggreen}{HTML}{00E278}
\definecolor{SlateGrey}{HTML}{2E2E2E}
\definecolor{LightGrey}{HTML}{666666}
\colorlet{name}{black}
\colorlet{tagline}{darkcolor}
\colorlet{heading}{darkcolor}
\colorlet{headingrule}{cvblue}
\colorlet{accent}{darkcolor}
\colorlet{emphasis}{SlateGrey}
\colorlet{body}{LightGrey}

% serif fonts - Using standard fonts for Overleaf compatibility
% \usepackage{CormorantGaramond}
% \usepackage{charter}
\usepackage{mathptmx} % Times-like font, widely available

% Adjust margins
\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1.19in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.4in}
\urlstyle{same}

\definecolor{airforceblue}{rgb}{0.36, 0.54, 0.66}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large\bfseries
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% pdfgentounicode removed for better compatibility across different LaTeX distributions

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-1pt}}
  }
}

\newcommand{\resumeItemNoBullet}[1]{
  \item[]\small{
    {#1 \vspace{-1pt}}
  }
}

\newcommand{\classesList}[4]{
    \item\small{
        {#1 #2 #3 #4 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{1.0\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{\large#1} & \textbf{\small #2} \\
      \textit{\large#3} & \textit{\small #4} \\

    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSingleSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{1.0\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{\large#1} & \textbf{\small #2} \\

    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{1.001\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & \textbf{\small #2}\\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemi{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand\labelitemii{$\circ$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.0in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.1in]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\newcommand\sbullet[1][.5]{\mathbin{\vcenter{\hbox{\scalebox{#1}{$\bullet$}}}}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}
%----------HEADING----------

"""

    def generate_complete_resume(self, output_file: str = "resume.tex"):
        """Generate complete LaTeX resume"""
        self.load_data()

        latex_content = self.generate_latex_preamble()
        latex_content += self.generate_header()
        latex_content += "\n"
        # Order: Skills -> Awards -> Experience -> Education -> Activities
        latex_content += self.generate_skills()
        latex_content += "\n"
        latex_content += self.generate_awards()
        latex_content += "\n"
        latex_content += self.generate_experience()
        latex_content += "\n"
        latex_content += self.generate_education()
        latex_content += "\n"
        latex_content += self.generate_activities()
        latex_content += "\n"
        latex_content += r"\end{document}"

        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(latex_content)

        print(f"Resume generated successfully: {output_file}")
        return output_file


def main():
    generator = ResumeGenerator()
    output_file = generator.generate_complete_resume("resume.tex")
    print(f"\nTo compile the resume, run:")
    print(f"  pdflatex {output_file}")
    print(f"  pdflatex {output_file}  # Run twice for proper formatting")


if __name__ == "__main__":
    main()
