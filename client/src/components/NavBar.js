import { NavLink } from "react-router-dom";
import './NavBar.css';

export default function NavBar(){
    return (
        <div class='nav-bar-container'>
            <h1 class='website-title'>Gunpla Management System</h1>
            <nav class='nav-bar-navs'>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/">Home</NavLink>
            </nav>
            <input 
                type="text" 
                placeholder="Search" 
                class='nav-bar-search-bar'
            />
        </div>
    );
}