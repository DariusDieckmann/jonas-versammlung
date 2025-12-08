"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [toc, setToc] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Extract headings from markdown content
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        const headings: TocItem[] = [];
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            headings.push({ id, text, level });
        }

        setToc(headings);
    }, [content]);

    useEffect(() => {
        // Track scroll position and update active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" },
        );

        const headings = document.querySelectorAll("h2, h3");
        headings.forEach((heading) => observer.observe(heading));

        return () => {
            headings.forEach((heading) => observer.unobserve(heading));
        };
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <nav className="sticky top-24 hidden xl:block">
            <div className="text-sm">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Auf dieser Seite
                </h4>
                <ul className="space-y-2 border-l-2 border-gray-200">
                    {toc.map((item) => (
                        <li
                            key={item.id}
                            style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                        >
                            <a
                                href={`#${item.id}`}
                                className={cn(
                                    "block py-1 pl-3 border-l-2 -ml-[2px] transition-colors",
                                    activeId === item.id
                                        ? "border-blue-600 text-blue-600 font-medium"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400",
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(item.id);
                                    if (element) {
                                        const offset = 80;
                                        const elementPosition =
                                            element.getBoundingClientRect().top;
                                        const offsetPosition =
                                            elementPosition + window.pageYOffset - offset;

                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: "smooth",
                                        });
                                    }
                                }}
                            >
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
