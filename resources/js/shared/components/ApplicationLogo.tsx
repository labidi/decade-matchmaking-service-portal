import { ImgHTMLAttributes } from 'react';
import { Link, usePage } from '@inertiajs/react';


export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <Link href={route('index')} className="inline-flex items-center">
            <img src='/assets/img/logo.png' alt="Ocean Connector Logo" className="h-20 w-auto object-contain md:h-28" {...props} />
        </Link>

    );
}
