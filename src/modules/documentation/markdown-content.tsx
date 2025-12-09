"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
    content: string;
    className?: string;
}

// Helper function to generate ID from text
function generateId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div className={`markdown-content ${className || ""}`}>
            <ReactMarkdown
                components={{
                    h1: ({ children }) => {
                        const text = String(children);
                        const id = generateId(text);
                        return (
                            <h1
                                id={id}
                                className="text-4xl font-bold text-gray-900 mb-4 mt-8"
                            >
                                {children}
                            </h1>
                        );
                    },
                    h2: ({ children }) => {
                        const text = String(children);
                        const id = generateId(text);
                        return (
                            <h2
                                id={id}
                                className="text-3xl font-bold text-gray-900 mb-3 mt-6"
                            >
                                {children}
                            </h2>
                        );
                    },
                    h3: ({ children }) => {
                        const text = String(children);
                        const id = generateId(text);
                        return (
                            <h3
                                id={id}
                                className="text-2xl font-semibold text-gray-900 mb-2 mt-4"
                            >
                                {children}
                            </h3>
                        );
                    },
                    p: ({ children }) => (
                        <p className="text-gray-700 leading-relaxed mb-4">
                            {children}
                        </p>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-blue-600 hover:underline"
                        >
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-6 my-4 space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-6 my-4 space-y-2">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-700">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-600">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, className }) => {
                        const isCodeBlock = className?.includes("language-");
                        if (isCodeBlock) {
                            return (
                                <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="text-pink-600 bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                                {children}
                            </code>
                        );
                    },
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                            {children}
                        </strong>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="w-full border-collapse">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-100">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border border-gray-300 p-3 text-left font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-gray-300 p-3">
                            {children}
                        </td>
                    ),
                    hr: () => <hr className="border-gray-300 my-8" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
