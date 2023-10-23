import logo from './logo.svg';
import './App.css';
import { eventWrapper } from '@testing-library/user-event/dist/utils';
import React, {useState} from 'react';
// import mammoth from 'mammoth';
import PizZip from 'pizzip';
import { DOMParser } from '@xmldom/xmldom';

const wordMinimum = 10;

const result = {
	text: 'Hello, world!',
	predicted_class: 'Machine',
	confidence_percentage: 70,
};

const App = () => {
	const [inputType, setInputType] = useState('file');
	const [text, setText] = useState('');
	const [file, setFile] = useState(null);
	// const [content, setContent] = useState('');
	const [showContent, setShowContent] = useState(false);
	const [paragraphs, setParagraphs] = useState([]);

	const str2xml = (str) => {
		if(str.charCodeAt(0) === 65279){
			str = str.substr(1);
		}
		return new DOMParser().parseFromString(str, "text/xml");
	};

	const getParagraphs = (content) => {
		const zip = new PizZip(content);
		const xml = str2xml(zip.files["word/document.xml"].asText());
		const paragraphsXml = xml.getElementsByTagName("w:p");
		const paragraphs = [];
		for (let i = 0, len = paragraphsXml.length; i < len; i++){
			let fullText = '';
			const textsXml = paragraphsXml[i].getElementsByTagName("w:t");
			for (let j = 0, len2 = textsXml.length; j < len2; j++){
				const textXml = textsXml[j];
				if (textXml.childNodes){
					fullText += textXml.childNodes[0].nodeValue;
				}
			}
			if(fullText){
				paragraphs.push(fullText);
			}
		}
		return paragraphs;
	};

	const handleInputChange = (event) => {
		if (event.target.value === 'file'){
			setInputType('file');
		}else{
			setInputType('text');
		}
	};

	const handleTextChange = (event) => {
		// setContent(event.target.value)
		setText(event.target.value);
		setParagraphs(event.target.value.split('\n'));
	};

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		setFile(selectedFile);
	};

	const handleFileRead = (event) => {
		const fileContent = event.target.result;
		const paragraphs = getParagraphs(fileContent);

		// mammoth.extractRawText({arrayBuffer: fileContent})
		// 	.then((result) => {
		// 		const docText = result.value;
		// 		setContent(docText);
		// 	}).catch((error) => {
		// 		console.error(error);
		// 	});
		// setParagraphs(paragraphs);
		console.log('paragraphs', paragraphs);
		setParagraphs(paragraphs);
		setShowContent(true);
	};

	const handleSubmit = () => {
		if (inputType === 'file'){
			console.log('upload file', file);
		}else{
			console.log('input text', text);
		}
		setShowContent(true);
		if (inputType === 'file' && file){
			const reader = new FileReader();
			reader.onload = handleFileRead;
			reader.readAsBinaryString(file);
			// reader.readAsText(file);
		}else{
			setShowContent(true);
		}
	};

	const handleClear = () => {
		setInputType('file');
		setText('');
		// setContent('');
		setParagraphs([]);
		setFile(null);
		setShowContent(false);
	};

	return (
		<div className='Aigc-detector-header'>
			<header>
 				<title>Content Classification</title>
 			</header>
			<body>
				<h1>Content Classification</h1>
				<div>
					{!showContent && (
						<div>
							<h1>Upload file or input text</h1>
							<div>
								<label>
									<input
										type='radio'
										value='file'
										checked={inputType === 'file'}
										onChange={handleInputChange}
									/>
									Upload file
								</label>
								<label>
									<input
										type='radio'
										value='text'
										checked={inputType === 'text'}
										onChange={handleInputChange}
									/>
									Input text
								</label>
							</div>
							{inputType === 'file' ? (
								<div>
									<input type='file' accept='.docx' onChange={handleFileChange} />
								</div>
								) : (
								<div>
									<textarea value={text} onChange={handleTextChange} />
								</div>
							)}
							<button onClick={handleSubmit}>Submit</button>
						</div>
					)}
					{showContent && (
						<div>
							<br></br>
							{/* <p> Text Content: {paragraphs.join('\n')}</p> */}
							<p> Text Content: </p>
							{paragraphs.filter(text => text.split(' ').length > wordMinimum)
									   .map((text, index) => (
								<p 	key={index}
									style={text.trim().endsWith('(chatgpt)') ||
										text.trim().endsWith('(Google Bard AI)') ||
										text.trim().endsWith('(Prexlexity AI)') ||
										text.trim().endsWith(')') ?
										{backgroundColor: 'yellow'} : {}}>
								 	{text}
								</p>
							))}
							<button onClick={handleClear}>Clear</button>
						</div>
					)}
				</div>
			</body>
		</div>
	);
};

// const App = () => {
// 	return(
// 		<div className='Aigc-detector-header'>
// 			<header>
// 				<title>Content Classification</title>
// 			</header>
// 			<body>
// 				<h1>Content Classification</h1>
// 				<form method='POST'>
// 					<textarea name='text_input' rows='4' cols='50'></textarea>
// 					<br></br>
// 					<input type='submit' value='Classify'></input>
// 				</form>
// 				<br></br>
// 				<p> Input Text: {result.text}</p>
// 				<p> Class: 
// 					<span style={{ color: result.predicted_class === 'Human' ? 'green' : 'red' }}>{result.predicted_class}</span>
// 				</p>
// 				<p> Confidence: {result.confidence_percentage}</p>
// 			</body>
// 		</div>
//   	);
// }

export default App;
