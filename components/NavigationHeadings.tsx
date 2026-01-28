"use client"
import { usePathname } from "next/navigation";

function Navigation(){
    const path = usePathname();
    const pagesNames = path.split("/");
    const heading = pagesNames.length > 2 ? pagesNames[2] : pagesNames[1];
    return(
    <h1 className="flex text-lg font-semibold capitalize">
        {heading}
    </h1>
)

}

export default Navigation;