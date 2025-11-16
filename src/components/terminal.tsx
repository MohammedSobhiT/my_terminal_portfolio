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

  const styled = (text: string, ...styles: string[]) =>
    `${styles.join("")}${text}${colors.reset}`;

  const prompt = () => styled("Sobhi@portfolio:~$ ", colors.blue ,colors.bold);

  const typeResponse = (term: xterm, text: string, delay: number = 30) => {
    let charIndex = 0;
    const type = () => {
      if (charIndex < text.length) {
        term.write(text[charIndex]);
        charIndex++;
        setTimeout(type, delay);
      } else {
        term.write(prompt());
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
      // Do nothing for empty command
      term.write(prompt());
    } else {
      const response = `Command not found: '${cmd}'. Type 'help' for available commands.\r\n`;
      typeResponse(term, response);
    }
  };

  useEffect(() => {
    // Only create terminal if it doesn't exist
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
        cols: 80, // Set default columns
        rows: 24, // Set default rows
      });

      term.open(termRef.current);
      
      // Fit terminal to container
      const fitTerminal = () => {
        const container = termRef.current;
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        // Calculate cols and rows based on character size
        const charWidth = 9; // Approximate character width in pixels
        const charHeight = 17; // Approximate character height in pixels
        
        const cols = Math.floor(containerWidth / charWidth) - 2;
        const rows = Math.floor(containerHeight / charHeight) - 2;
        
        term.resize(cols, rows);
      };
      
      // Initial fit
      setTimeout(fitTerminal, 100);
      
      // Fit on window resize
      window.addEventListener('resize', fitTerminal);
      
      term.focus();
      
      const webLinksAddon = new WebLinksAddon();
      term.loadAddon(webLinksAddon);
      
      termInstanceRef.current = term;

      term.write(`${styled("Sobhi@portfolio:~$ ", colors.blue,colors.bold)}${styled("welcome", colors.green)}`);
      term.write(`\r\n\r\n`);
      term.write(`Hi, I'm Mohammed Sobhi, a Software Engineer From Egypt.`);
      term.write(`\r\n\r\n\r\n`);
      term.write(`Welcome to my interactive portfolio terminal!`);
      term.write(`\r\n`);
      term.write(`Type ${styled("'help'", colors.yellow, colors.bold)} to see available commands.`);
      term.write(`\r\n\r\n\r\n`);
      term.write(prompt());

      term.onData((data: string) => {
        const code = data.charCodeAt(0);

        // Handle Enter key
        if (code === 13) {
          term.write("\r\n");
          executeCommand(term, inputBuffer.current);
          console.log("Executed command:", inputBuffer.current);
          inputBuffer.current = "";
        }
        // Handle Backspace (code 127 or 8)
        else if (code === 127 || code === 8) {
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.write("\b \b"); // Move back, write space, move back again
          }
        }
        // Handle Ctrl+C
        else if (code === 3) {
          term.write("^C\r\n");
          inputBuffer.current = "";
          term.write(prompt());
        }

        // Handle regular characters
        else if (code >= 32 && code <= 126) {
          inputBuffer.current += data;
          term.write(styled(data, colors.green));
        }
      });

      // Cleanup function
      return () => {
        window.removeEventListener('resize', fitTerminal);
        term.dispose();
        termInstanceRef.current = null;
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
    {/*command nav - hidden on mobile*/}
    <ul className="hidden lg:flex p-4 bg-black border-b border-green-500">
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
    <div className="w-full bg-black flex items-center justify-center overflow-hidden">
      
      <div
        id="terminal"
        ref={termRef}
        className="w-full h-full bg-black p-3 sm:p-4"
      ></div>
    </div>
    </>
  );
}