import React from 'react';
import {Link} from '@inertiajs/react';
import ApplicationLogo from '@/Components/Common/ApplicationLogo';
import FlanderLogo from '@/Components/Common/FlanderLogo';
import {Instagram, Facebook, Linkedin} from 'lucide-react';

const Header: React.FC = () => {
    return (
        <section id="footer" className="bg-gray-700 py-8 px-4">
            <div className='container grid md:grid-cols-5 gap-3 mx-auto'>
                <div>
                    <ApplicationLogo/>

                </div>
                <div><FlanderLogo/></div>
                <div>
                    <span className='text font-bold text-white'>Contact</span>
                    <p className='text-white'>Capacity Development Facility</p>
                    <p className='text-white'>UNESCO Headquarters, 7 Place de Fontenoy, 75007</p>
                    <p className='text-white'>Paris <br/> France</p>
                    <a className='text-white' href="mailto:cdf@unesco.org">cdf@unesco.org</a>
                </div>
                <div>
                    <span className='font-bold text-white'>Links</span>
                    <ul className='no-list-style'>
                        <li>
                            <a target="_blank" rel="noopener noreferrer" title='Ocean Decade Website'
                               className='text-white' href="http://oceandecade.org">Ocean Decade Website</a>
                        </li>
                        <li>
                            <a target="_blank" rel="noopener noreferrer" title='IOC-UNESCO' className='text-white'
                               href="http://ioc.unesco.org">IOC-UNESCO</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <ul className='no-list-style flex flex-row'>
                        <li className='basis-32'>
                            <a target="_blank" rel="noopener noreferrer" title='Twitter' className='text-white'
                               href="https://twitter.com/oceandecade">
                                <svg className="text-white" height="24px" viewBox="0 0 24 24" width="24px"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
                                        <g fill="currentColor" fillRule="nonzero" transform="translate(0, 1.1)">
                                            <path
                                                d="M18.8996089,0 L22.5814863,0 L14.5397653,9.21237981 L24,21.75 L16.5945241,21.75 L10.7900913,14.1479567 L4.15645372,21.75 L0.469361147,21.75 L9.06910039,11.8945312 L0,0 L7.59322034,0 L12.8344198,6.9484976 L18.8996089,0 Z M17.6062581,19.5436298 L19.6453716,19.5436298 L6.48239896,2.09134615 L4.29204694,2.09134615 L17.6062581,19.5436298 Z"></path>
                                        </g>
                                    </g>
                                </svg>
                            </a>
                        </li>
                        <li className='basis-32'>
                            <a target="_blank" rel="noopener noreferrer" title='Twitter' className='text-white'
                               href="https://www.instagram.com/unoceandecade/">
                                <Instagram/>
                            </a>
                        </li>
                        <li className='basis-32'>
                            <a target="_blank" rel="noopener noreferrer" title='Twitter' className='text-white'
                               href="https://www.facebook.com/oceandecade">
                                <Facebook/>
                            </a>
                        </li>
                        <li className='basis-32'>
                            <a target="_blank" rel="noopener noreferrer" title='Twitter' className='text-white'
                               href="https://www.linkedin.com/company/un-ocean-decade/">
                                <Linkedin/>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Header;
