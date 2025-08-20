import { Link } from '@inertiajs/react';
import React from 'react';

interface CardLinkProps {
    title: string;
    text: string;
    link: string;
    className: string;
}

const CardLink: React.FC<CardLinkProps> = ({ title, text, link, className }) => (
    <Link href={link} className={className}>
        <div>
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{title}</div>
                <p className="text-base">{text}</p>
            </div>
        </div>
    </Link>
);

export default CardLink; 