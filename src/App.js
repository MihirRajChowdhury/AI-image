import React, { useState } from "react";
function App() {
  const [image, setImage] = useState(null);
  const [value,setValue] = useState("");
  const [response,setResponse] = useState("")
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
const randomQuestions = [
    "What are the primary objects that stand out in the image?",
"Is there any furniture or man-made objects visible in the scene?",
"Can you spot any animals, vehicles, or people in the image?",
"Do you see any natural elements like trees, water, or mountains?",
"Are there any small or detailed objects, such as electronics, tools, or decorations?"
  ]

  const generateRandom = ()=>{
    const question =Math.floor(Math.random()* randomQuestions.length);
    setValue(randomQuestions[question])
  }


  const handleChange = async (e)=>{
    const formData = new FormData();
    e.preventDefault();
    formData.append("file",e.target.files[0])
    setImage(e.target.files[0]);
    try {
      const options = {
        method:"POST",
        body:formData
      }
      const response = await fetch("http://localhost:8000/upload",options);
      const data = await response.json();
    } catch (err) {
      setError("Error in handle Click")
    }
  }



  const analyzeImage=async ()=>{
    setAnalyzing(true);
    if(!image){
      setError("Please input an image first")
      return
    }
    try {
      const options = {
        method:"POST",
        body:JSON.stringify({
          message:value
        }),
        headers:{
          "Content-Type": "application/json"
        }
      }
      const response = await fetch("http://localhost:8000/gemini",options)
      const data = await response.text();
      setAnalyzing(false);
      setResponse(data);

      
    } catch (err) {
      console.log(err);
      setError("Some problem occured while analyzing the image on the backend")
    }

  }
  const clearImage=()=>{
    setImage("");
    setValue("");
    setError("");
    setResponse("");

  }
  
  return (
   <div>

<section className="search-section">
<div className="image-container">
{
// @ts-ignore
image? <img style={{height:200,width:200}} src={URL.createObjectURL(image)} alt=" image" />:""
}
</div> 
<p className="extra-info">
  <span>
  <label htmlFor="imageUpload">Upload an image by clicking me </label>
  <input onChange={handleChange} hidden type="file" id="imageUpload" accept="image/*"/>
  </span>
  to ask questions about
</p>
<p>What do you want to know about the image 
<button onClick={generateRandom}>Surprise me</button>
</p>
<div className="input-container">
<input type="text" style={{padding:10,margin:10}} value = {value} placeholder="What is there in the image" onChange = {(e)=>{
            setValue(e.target.value)
          }} />
          {(!response && !error) && <button style={{padding:10}} onClick={analyzeImage}>Ask me</button> }
          {(response || error) && <button style={{padding:10}} onClick={clearImage}>Clear</button> }

</div>
    {(analyzing) && <p>Your Response is being prepared</p>}
     {error && <p>{error}</p>}
     {response && <p>{response}</p>}
</section>
   </div>
  );
}

export default App;
