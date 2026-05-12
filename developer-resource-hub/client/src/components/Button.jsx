import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  children,
  variant = "primary",
  active = false,
  as = "button",
  to,
  href,
  className = "",
  ...props
}) {
  let baseClass = "";

  if (variant === "primary") {
    baseClass = "btn-primary";
  } else if (variant === "secondary") {
    baseClass = "btn-secondary";
  } else if (variant === "filter") {
    baseClass = `btn-filter ${active ? "btn-filter-active" : "btn-filter-inactive"}`;
  }

  const combinedClassName = `${baseClass} ${className}`.trim();

  if (as === "Link" || to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  if (as === "a" || href) {
    return (
      <a href={href} className={combinedClassName} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
