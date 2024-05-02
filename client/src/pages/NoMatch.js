import './NoMatch.css'

export default function NoMatch(){
    return (
        <>
            <div className='nomatch-page-wrapper'>
                <div className='nomatch-container'>
                    <h1>404</h1>
                    <p className='nomatch-text'>This page could not be found</p>
                    <p className='nomatch-text'>Please try again and contact the site administator</p>
                </div>
            </div>
        </>
    );
}