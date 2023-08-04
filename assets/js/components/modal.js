import {
	create_element
} from '../helper.js';

export default async function modal(params) {
	let {modal_template, okay, other, id, overlay_close} = params;
	let {header, body, footer} = modal_template;
	let modal = create_element('div');
	if (id) modal.setAttribute('id', id);
	
	document.body.classList.add('overflow-hidden');
	modal.classList.add('modal');
	modal.innerHTML = `
	<div class="overlay"></div>
	<div class="modal-dialog">
		<div class="modal-content">
			
		</div>
	</div>
	`;
	
	async function modal_header() {
		let div = create_element('div');
		div.classList.add('modal-header');
		div.innerHTML = header['html'];
		await remove_modal('#close');
		
		return div;
	}
	
	async function modal_body() {
		let div = create_element('div');
		div.classList.add('modal-body');
		div.innerHTML = body['html'];
		
		return div;
	}
	
	async function modal_footer() {
		let div = create_element('div');
		div.classList.add('modal-footer');
		div.innerHTML = footer['html'];
		if (div.querySelector('#ok')) {
			div.querySelector('#ok').addEventListener('click', async () => {
				await okay({id: id});
				document.querySelector('#' + id).remove();
			});
		}
		
		if (div.querySelector('#other')) {
			div.querySelector('#other').addEventListener('click', async () => {
				await other({id: id});
				document.querySelector('#' + id).remove();
			});
		}
		
		if (div.querySelector('#cancel')) {
			div.querySelector('#cancel').addEventListener('click', () => {
				modal.remove();
				document.body.classList.remove('overflow-hidden');
			});
		}
		
		return div;
	}
	
	if (header) modal.querySelector('.modal-content').appendChild(await modal_header());
	if (body) modal.querySelector('.modal-content').appendChild(await modal_body());
	if (footer) modal.querySelector('.modal-content').appendChild(await modal_footer());
	
	modal.querySelector('.overlay').addEventListener('click', () => {
		if (!overlay_close || overlay_close != true) return false;
		modal.remove();
		document.body.classList.remove('overflow-hidden');
	})
	
	return modal;
}