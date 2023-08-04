import {
	create_element
} from '../helper.js';

export default async function breadcrumbs(params) {
	let div = create_element('div');
	div.classList.add('breadcrumbs');
	div.innerHTML = `
	<div class="container">
		
	</div>
	`;
	
	params.map(link => {
		let {url, text} = link;
		let a = create_element('a');
		a.classList.add('link');
		a.innerHTML = text;
		a.setAttribute('href', url);
		
		div.querySelector('.container').appendChild(a);
	});
	
	return div;
}