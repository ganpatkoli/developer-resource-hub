import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, CalendarDays, UserCircle, Eye, Home, Radio } from "lucide-react";
import client from "../api/client";
import { useTheme } from "../context/ThemeContext";
import "./ToolkitDetail.css";

const generateId = (text) => String(text || "")
  .trim()
  .toLowerCase()
  .replace(/[^\w\s-]/g, "")
  .replace(/\s+/g, "-");

const cleanText = (str) => String(str || "")
  .replace(/#{1,6}\s+/g, "")
  .replace(/\*\*/g, "")
  .replace(/__/g, "")
  .replace(/[`*]/g, "")
  .replace(/---/g, "")
  .trim();

export default function ToolkitDetail() {
  const { slug } = useParams();
  const { dark } = useTheme();
  const [toolkit, setToolkit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await client.get(`/toolkits/public/${slug}`);
        if (!mounted) return;
        setToolkit(data);
        client.patch(`/toolkits/public/${slug}/view`).catch(() => {});
      } catch {
        if (mounted) setToolkit(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Combined parser to ensure TOC and Content are always in sync
  const { sections, blocks } = useMemo(() => {
    if (!toolkit?.content && !toolkit?.description) return { sections: [], blocks: [] };
    const text = toolkit.content || toolkit.description;
    const lines = text.split("\n").map(l => l.trim());
    
    let sectionsList = [];
    let blocksList = [];
    let currentBlock = [];
    
    const flush = () => {
      if (currentBlock.length > 0) {
        blocksList.push({
          type: currentBlock.length > 1 ? "list" : "paragraph",
          text: cleanText(currentBlock.join(" ")),
          items: currentBlock.map(cleanText)
        });
        currentBlock = [];
      }
    };
    
    lines.forEach((line) => {
      if (!line) {
        flush();
        return;
      }
      
      const isMdHeading = /^#{1,4}\s+/.test(line);
      const isBold = (line.startsWith("**") && line.endsWith("**"));
      const isNumbered = /^\d+\.\s/.test(line) && line.length < 90;
      
      // Filter conversational filler, but NEVER filter a Markdown heading
      const isMeta = !isMdHeading && (
        (line.toLowerCase().startsWith("by ") && line.length < 60) || 
        line.toLowerCase().startsWith("certainly!") || 
        line.toLowerCase().includes("here is the")
      );

      if ((isMdHeading || isBold || isNumbered) && !isMeta) {
        flush();
        const cleaned = cleanText(line);
        const id = generateId(cleaned);
        sectionsList.push(cleaned);
        blocksList.push({
          type: "heading",
          text: cleaned,
          id: id
        });
      } else {
        currentBlock.push(line);
      }
    });
    flush();
    
    return { sections: sectionsList.slice(0, 25), blocks: blocksList };
  }, [toolkit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.findIndex(s => generateId(s) === entry.target.id);
            if (index !== -1) setActiveSection(index);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [blocks, sections]);

  const scrollToSection = (index) => {
    const title = sections[index];
    if (title) {
      const id = generateId(title);
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10131a]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <span className="text-cyan-500 font-medium">Decrypting Data...</span>
        </div>
      </div>
    );
  }

  if (!toolkit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10131a] text-slate-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Toolkit Not Found</h2>
          <Link to="/" className="text-cyan-500 hover:underline">Return to Hub</Link>
        </div>
      </div>
    );
  }

  // Local counter for ref assignment during render
  let headingCount = 0;

  return (
    <div className={`min-h-screen ${dark ? "bg-[#10131a]" : "bg-slate-50"} transition-colors duration-300 relative`}>
      <div className="toolkit-bg-grid"></div>
      
      <div className="toolkit-container">
        <aside className="toolkit-sidebar">
          <div className="toc-title">
            <Radio size={16} />
            <span>NEURAL INDEX</span>
          </div>
          <ul className="toc-list">
            {sections.map((s, i) => {
              const cleanedTextForNum = s.replace(/^\d+[\.\)]\s*/, "");
              return (
                <li 
                  key={i} 
                  className={`toc-item ${activeSection === i ? "active" : ""}`}
                  onClick={() => scrollToSection(i)}
                >
                  <span className="toc-number">{i + 1}.</span>
                  <span className="toc-text">{cleanedTextForNum}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="toolkit-main">
          <nav className="breadcrumbs">
            <div className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link"><Home size={14} /></Link>
              <ChevronRight size={12} />
            </div>
            <div className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link">Archives</Link>
              <ChevronRight size={12} />
            </div>
            <span className="breadcrumb-current">{toolkit.title}</span>
          </nav>

          <h1 className="toolkit-title">{toolkit.title}</h1>
          
          <div className="toolkit-meta">
            <div className="meta-item">
              <UserCircle size={14} />
              <span>{toolkit.audience || "SYSTEM ARCHIVIST"}</span>
            </div>
            <div className="meta-item">
              <CalendarDays size={14} />
              <span>{new Date(toolkit.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            </div>
            <div className="meta-item">
              <Eye size={14} />
              <span>{toolkit.views || 0} ACCESS LOGS</span>
            </div>
          </div>

          <div className="toolkit-content">
            {blocks.length === 0 && (
              <p className="text-slate-400 italic">No archive data found.</p>
            )}
            {blocks.map((block, idx) => {
              if (block.type === "heading") {
                const currentIdx = headingCount++;
                return (
                  <h2
                    key={`heading-${idx}`}
                    id={block.id}
                    ref={el => sectionRefs.current[currentIdx] = el}
                    className="toolkit-heading"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "list") {
                return (
                  <div key={`list-${idx}`} className="toolkit-list">
                    {block.items.map((item, i) => {
                      const isItemNumbered = /^\d+[\.\)]/.test(item);
                      const symbol = item.startsWith("-") || item.startsWith("*") ? "•" : (isItemNumbered ? item.split(/[\.\)]/)[0] + "." : "•");
                      const text = item.replace(/^[-*\d.\)]+\s+/, "");
                      return (
                        <div key={`li-${idx}-${i}`} className="toolkit-list-item">
                          <span className="bullet-symbol">{symbol}</span>
                          <span className="list-text">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return (
                <p key={`p-${idx}`} className="toolkit-paragraph">
                  {block.text}
                </p>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
