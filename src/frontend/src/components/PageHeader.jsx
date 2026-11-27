import React from 'react';

/** Title, subtitle and action buttons shown at the top of a page. */
const PageHeader = ({ title, subtitle, children }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>
);

export default PageHeader;
