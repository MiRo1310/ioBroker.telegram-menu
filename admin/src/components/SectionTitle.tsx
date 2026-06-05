import React from 'react';

interface Props {
    title: string;
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p';
}

function SectionTitle({ title, className = 'settings__telegram-header', tag: Tag = 'p' }: Props): React.ReactElement {
    return <Tag className={className}>{title}</Tag>;
}

export default SectionTitle;
