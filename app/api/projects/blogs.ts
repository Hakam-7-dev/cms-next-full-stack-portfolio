async function CreateBlogSupabase(title: string, content: string) {
    const response = await fetch("/api/projects", {
        method: "POST",
        headers: {"Content-type": "application/json",},
        body: JSON.stringify({title, content})
    })
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create project");
  }
  return response.json();
    
}

export default CreateBlogSupabase;
