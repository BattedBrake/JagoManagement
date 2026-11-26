import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9.5L16 4l10 5.5v13L16 28 6 22.5v-13Z" fill="currentColor" opacity=".22" />
            <path d="M9 11.2 16 7l7 4.2-7 4.2-7-4.2Z" fill="currentColor" />
            <path d="M8.5 14.4 15 18v6.4l-6.5-3.7v-6.3ZM23.5 14.4 17 18v6.4l6.5-3.7v-6.3Z" fill="currentColor" />
        </svg>
    );
}
