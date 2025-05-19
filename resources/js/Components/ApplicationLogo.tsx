import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <img src='/assets/img/logo.png' alt="Logo" className="h-20" {...props} /> 
    );
}
