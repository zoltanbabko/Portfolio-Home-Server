document.addEventListener('DOMContentLoaded', () => {
    // Toggle Mode
    const toggle = document.getElementById('terminal-toggle');
    const mainContent = document.getElementById('main-content');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    toggle.addEventListener('change', () => {
        if(toggle.checked) {
            mainContent.classList.add('hidden');
            terminalOverlay.classList.remove('hidden');
            terminalInput.focus();
        } else {
            mainContent.classList.remove('hidden');
            terminalOverlay.classList.add('hidden');
        }
    });

    // Terminal Logic
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.toLowerCase().trim();
            handleCommand(command);
            this.value = '';
        }
    });

    function handleCommand(cmd) {
        let response = '';
        const historyLine = document.createElement('div');
        historyLine.innerHTML = `<span style="color:#33ff00">zoltan@epitech:~$</span> <span style="color:white">${cmd}</span>`;
        terminalOutput.insertBefore(historyLine, document.querySelector('.input-line'));

        switch(cmd) {
            case 'help':
                response = `Available commands:
- <span class="cmd">about</span>: Who am I?
- <span class="cmd">skills</span>: My technical stack
- <span class="cmd">exp</span>: Work experience
- <span class="cmd">contact</span>: How to reach me
- <span class="cmd">clear</span>: Clear terminal
- <span class="cmd">exit</span>: Return to GUI mode`;
                break;
            case 'about':
                response = "Zoltan Babko, 20 years old. Epitech student (3rd year). Looking for an internship from March 29 to July 29, 2026.";
                break;
            case 'skills':
                response = "C, C++, Python, Haskell, Django, React, Docker, Linux, PostgreSQL.";
                break;
            case 'exp':
                response = `
1. Agence Piscines & Spas (2025-Now): No-Code Dev
2. Rashomon Escape (2025-Now): Game Master
3. Alltoo (2024): Full-Stack Intern (Python/Django)
4. Epitech (2023-Now): Ambassador`;
                break;
            case 'contact':
                response = "Email: zoltan.babko@epitech.eu | Tel: 06 77 32 08 20 | Loc: Paris";
                break;
            case 'clear':
                // Remove all previous lines except the input line
                const lines = terminalOutput.querySelectorAll('div:not(.input-line)');
                lines.forEach(line => line.remove());
                return; // Exit function to avoid printing response
            case 'exit':
                toggle.checked = false;
                mainContent.classList.remove('hidden');
                terminalOverlay.classList.add('hidden');
                return;
            default:
                response = `Command not found: ${cmd}. Type 'help' for list.`;
        }

        const respLine = document.createElement('div');
        respLine.innerHTML = response;
        respLine.style.color = '#ccc';
        respLine.style.marginBottom = '10px';
        respLine.style.whiteSpace = 'pre-line'; // Preserves line breaks
        terminalOutput.insertBefore(respLine, document.querySelector('.input-line'));
        
        // Auto scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
});