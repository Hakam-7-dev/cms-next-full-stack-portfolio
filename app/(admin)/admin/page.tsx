"use client"
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card"

import { useEffect, useReducer } from "react"
function AdminPage() {

const [data, setData] = useReducer((prev, next) => {
    return {...prev, ...next}
}, {
    loading: true,
    project: null,
    blogs: null
})
    const fetchDashboardDetail = async () => {
        const response = await fetch("/api/app").then(res => res.json())
        setData({
                ...response,
                loading: false
        })
    }
    useEffect(() => {
        fetchDashboardDetail();
    }, [])


    return (
      <div className="flex text-center justify-evenly flex-wrap">
        <Card className="w-52 p-4">
            <CardTitle className="text-2xl">
                Total projects
            </CardTitle>
            <CardContent>
                {data.loading ? (
                    <div className="animate-pulse">
                        <h2 className="h-2 bg-slate-200 rounded-md"></h2>
                    </div>
                ): (
            <h2 className="text-5xl mt-7 font-semibold">
                {data.project}
            </h2>
                )}
            </CardContent>
        </Card>
        <Card className="w-52 p-4">
             <CardTitle className="text-2xl">
                Total blogs
            </CardTitle>
             <CardContent>
                {data.loading ? (
                    <div className="animate-pulse">
                        <h2 className="h-2 bg-slate-200 rounded-md"></h2>
                    </div>
                ): (
            <h2 className="text-5xl mt-7 font-semibold">
                {data.blogs}
            </h2>
                )}
            </CardContent>
        </Card>
      </div>
    )
}
export default AdminPage