import { SVGAttributes } from 'react';
import { Link, usePage } from '@inertiajs/react';


export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <Link href={route('index')} className="inline-flex items-center">
            <img src='/assets/img/logo.png' alt="Logo" className="h-28" {...props} />
        </Link>

    );
}
