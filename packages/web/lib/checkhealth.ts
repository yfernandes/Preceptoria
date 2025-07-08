import { treaty } from "@elysiajs/eden";
import  { App } from "server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create a basic treaty client for now
export const treatise = treaty<App>(API_BASE_URL);

console.log(JSON.stringify(treatise.health));
// const response = treatise.health;
    
