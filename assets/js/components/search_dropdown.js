import {
	create_element,
	render_icon
} from '../helper.js';

let template = create_element('div');
template.classList.add('position-relative', 'select');

let list = [];

export async function render(params) {
	let {data, callback_1} = params;
	list = [...data.datas];
	
	template.innerHTML = `
	<span class="placeholder">Chọn</span>
	<div class="dropdown">
	<div class="input">
		<input type="text" placeholder="Tìm kiếm">
	</div>
	<ul></ul>
	</div>
	`;
	
	let placeholder = template.querySelector('.placeholder'),
			dropdown = template.querySelector('.dropdown'),
			input = template.querySelector('input');
	
	placeholder.addEventListener('click', () => {
		dropdown.classList.toggle('show');
		input.focus();
	});
	
	input.addEventListener('input', async (e) => {
		let value = e.target.value.toLocaleLowerCase();
		let filter_list = [];
		
		filter_list = list.filter((i) => {
			if (i.titleSystem) {
				return i.titleSystem.toLowerCase().includes(value);
			}
		});
		
		if (value == '' || !value) {
			filter_list = [...list];
			placeholder.innerHTML = 'Chọn';
			placeholder.removeAttribute('data-code');
		}
		
		await render_list(filter_list);
	});
	
	async function render_list(params) {
		template.querySelector('ul').innerHTML = '';
		for (let item of params) {
			let li = create_element('li');
			if (item.titleSystem) li.innerHTML = item.titleSystem;
			li.addEventListener('click', async (e) => {
				placeholder.innerHTML = e.target.textContent;
				if (item.code) placeholder.setAttribute('data-code', item.code);
				dropdown.classList.remove('show');
				await callback_1();
			});

			template.querySelector('ul').appendChild(li);
		}
	}
	await render_list(list);
	
	window.addEventListener('mouseup', (e) => {
		document.querySelectorAll('.select').forEach(item => {
			if (!item.contains(e.target)) {
				if (!item.querySelector('.dropdown')) return false;
				item.querySelector('.dropdown').classList.remove('show');
			}
		});
	});
	
	return template;
}

export async function callback(params) {
	
}