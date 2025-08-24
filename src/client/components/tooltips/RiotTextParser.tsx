"use client";

import React from "react";

type Props = { text: string };

function isBrNode(n: ChildNode) {
  return n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName.toLowerCase() === "br";
}

function isWhitespaceText(n: ChildNode) {
  return n.nodeType === Node.TEXT_NODE && /^\s*$/.test(n.textContent ?? "");
}

function renderChildren(nodes: ChildNode[], keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let prevWasBr = false;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!;

    if (isWhitespaceText(n)) {
      if (!prevWasBr) out.push(n.textContent);
      continue;
    }

    const curIsBr = isBrNode(n);
    if (curIsBr && prevWasBr) continue;

    out.push(renderNode(n, `${keyPrefix}.${i}`));
    prevWasBr = curIsBr;
  }

  return out;
}

function renderNode(node: ChildNode, key: string): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      return <br key={key} />;
    }

    const children = renderChildren(Array.from(el.childNodes), key);

    switch (tag) {
      case "maintext":
        // bloc principal
        return (
          <div key={key} data-type="mainText" className="block space-y-2 text-sm leading-relaxed">
            {children}
          </div>
        );

      case "stats":
        // bloc de stats, paragraphe compact
        return (
          <p key={key} data-type="stats" className="leading-tight">
            {children}
          </p>
        );

      case "attention":
        // valeur à mettre en avant
        return (
          <strong key={key} data-type="attention" className="font-semibold text-yellow-400">
            {children}
          </strong>
        );

      case "passive":
        // nom de passif
        return (
          <strong key={key} data-type="passive" className="uppercase tracking-wide text-rose-400">
            {children}
          </strong>
        );

      case "magicdamage":
        // type de dégâts, emphase
        return (
          <em key={key} data-type="magicDamage" className="not-italic text-indigo-400 font-medium">
            {children}
          </em>
        );

      case "keyword":
        // terme de jeu, mis en évidence
        return (
          <mark
            key={key}
            data-type="keyword"
            className="bg-transparent font-semibold underline underline-offset-2 decoration-dotted"
          >
            {children}
          </mark>
        );

      default:
        // inconnu, inline par défaut
        return (
          <span key={key} data-type={tag}>
            {children}
          </span>
        );
    }
  }

  return null;
}

export function RiotTextParser({ text }: Props) {
  const doc = React.useMemo(() => {
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html");
  }, [text]);

  const nodes = Array.from(doc.body.childNodes);
  return <>{renderChildren(nodes, "n")}</>;
}
