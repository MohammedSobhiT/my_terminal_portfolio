import { useEffect, useRef } from "react";
import { Terminal as xterm } from "@xterm/xterm";
import { WebLinksAddon } from '@xterm/addon-web-links';
import { commands } from "../data/commands.json";
import { colors } from "../data/colors.json";
import "@xterm/xterm/css/xterm.css";

export default function Terminal() {
  const termRef = useRef<HTMLDivElement | null>(null);
  const termInstanceRef = useRef<xterm | null>(null);
  const inputBuffer = useRef<string>("");
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const styled = (text: string, ...styles: string[]) =>
    `${styles.join("")}${text}${colors.reset}`;

  const prompt = () => styled("Sobhi@portfolio:~$ ", colors.blue, colors.bold);

  const wrapText = (text: string, maxWidth: number): string => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        if (word.length > maxWidth) {
          let remaining = word;
          while (remaining.length > maxWidth) {
            lines.push(remaining.substring(0, maxWidth));
            remaining = remaining.substring(maxWidth);
          }
          currentLine = remaining;
        } else {
          currentLine = word;
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\r\n');
  };

  const typeResponse = (term: xterm, text: string, delay: number = 30) => {
    const lines = text.split('\n');
    const termWidth = term.cols;
    
    const processedLines = lines.map(line => {
      if (line.includes(' - ') || line.length < termWidth) {
        return line;
      }
      return wrapText(line, termWidth - 5);
    }).join('\r\n');
    
    let charIndex = 0;
    const type = () => {
      if (charIndex < processedLines.length) {
        term.write(processedLines[charIndex]);
        charIndex++;
        setTimeout(type, delay);
      } else {
        term.write('\r\n' + prompt());
      }
    };
    type();
  };

  const executeCommand = (term: xterm, cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (trimmedCmd === "clear") {
      term.clear();
      term.write(prompt());
      return;
    }

    if (trimmedCmd in commands) {
      const response = commands[trimmedCmd as keyof typeof commands] + "\r\n";
      typeResponse(term, response);
    } else if (trimmedCmd === "") {
      term.write(prompt());
    } else {
      const response = `Command not found: '${cmd}'. Type 'help' for available commands.\r\n`;
      typeResponse(term, response);
    }
  };

  useEffect(() => {
    if (termRef.current && !termInstanceRef.current) {
      const term = new xterm({
        cursorBlink: true,
        cursorStyle: "block",
        cursorWidth: 2,
        theme: {
          cursor: "#00c951",
          cursorAccent: "#000000",
          background: "#000000",
          foreground: "#ffffff",
          blue: "#3b82f6",
        },
        screenReaderMode: false,
        convertEol: true,
        cols: 80,
        rows: 24,
      });

      term.open(termRef.current);

      const fitTerminal = () => {
        const container = termRef.current;
        if (!container || !termInstanceRef.current) return;

        // Get the actual bounding box of the container
        const rect = container.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        // Get computed padding
        const computedStyle = window.getComputedStyle(container);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

        // Calculate available space
        const availableWidth = containerWidth - paddingLeft - paddingRight;
        const availableHeight = containerHeight - paddingTop - paddingBottom;

        // Try to get actual cell dimensions from terminal
        const core = (term as any)._core;
        const dimensions = core?._renderService?.dimensions;

        let charWidth = 9;
        let charHeight = 17;

        if (dimensions?.actualCellWidth && dimensions?.actualCellHeight) {
          charWidth = dimensions.actualCellWidth;
          charHeight = dimensions.actualCellHeight;
        }

        // Calculate new dimensions with minimum constraints
        const cols = Math.max(40, Math.floor(availableWidth / charWidth));
        const rows = Math.max(10, Math.floor(availableHeight / charHeight));

        if (term.cols !== cols || term.rows !== rows) {
          term.resize(cols, rows);
        }
      };

      // Initial fitting with multiple attempts
      initialFitTimeoutRef.current = setTimeout(() => {
        fitTerminal();
        setTimeout(fitTerminal, 150);
        setTimeout(fitTerminal, 300);
      }, 50);

      // Debounced resize handler
      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(fitTerminal, 150);
      };

      window.addEventListener('resize', handleResize);

      term.focus();

      const webLinksAddon = new WebLinksAddon();
      term.loadAddon(webLinksAddon);

      termInstanceRef.current = term;

      // Welcome message
      setTimeout(() => {
        const termWidth = term.cols - 5;
        term.write(`${styled("Sobhi@portfolio:~$ ", colors.blue, colors.bold)}${styled("welcome", colors.green)}`);
        term.write(`\r\n\r\n`);
        term.write(wrapText(`Hi, I'm Mohammed Sobhi, a Software Engineer From Egypt.`, termWidth));
        term.write(`\r\n\r\n\r\n`);
        term.write(wrapText(`Welcome to my interactive portfolio terminal!`, termWidth));
        term.write(`\r\n`);
        const helpText = wrapText(`Type 'help' to see available commands.`, termWidth);
        term.write(helpText.replace(/'help'/g, styled("'help'", colors.yellow, colors.bold)));
        term.write(`\r\n\r\n\r\n`);
        term.write(prompt());
      }, 200);

      // Handle input
      term.onData((data: string) => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          term.write("\r\n");
          executeCommand(term, inputBuffer.current);
          inputBuffer.current = "";
        } else if (code === 127 || code === 8) {
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.write("\b \b");
          }
        } else if (code === 3) {
          term.write("^C\r\n");
          inputBuffer.current = "";
          term.write(prompt());
        } else if (code === 12) {
          term.clear();
        } else if (code >= 32 && code <= 126) {
          inputBuffer.current += data;
          term.write(styled(data, colors.green));
        }
      });

      // Cleanup
      return () => {
        if (initialFitTimeoutRef.current) {
          clearTimeout(initialFitTimeoutRef.current);
        }
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        window.removeEventListener('resize', handleResize);
        term.dispose();
        termInstanceRef.current = null;
      };
    }
  }, []);

  return (
    <>
      {/* Command nav - hidden on mobile */}
      <ul className="hidden lg:flex p-4 bg-black border-b border-green-500 flex-wrap flex-shrink-0">
        <li className="border-r border-green-400 text-green-400 font-bold pr-4 text-xl">help</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">about</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">skills</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">projects</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">contact</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">experience</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">education</li>
        <li className="border-r border-green-400 text-green-400 font-bold px-4 text-xl">certifications</li>
        <li className="text-green-400 font-bold px-4 text-xl">clear</li>
      </ul>
      <div className="flex-1 w-full bg-black overflow-hidden min-h-0">
        <div
          id="terminal"
          ref={termRef}
          className="w-full h-full bg-black p-3 sm:p-4"
        ></div>
      </div>
    </>
  );
}