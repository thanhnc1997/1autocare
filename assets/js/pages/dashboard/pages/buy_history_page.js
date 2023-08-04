import {
	create_element,
	get_local_storage,
	bhdt_api,
	api_end_point,
	fetch_data
} from '../../../helper.js';

import dashboard_nav from '../../../components/dashboard_nav.js';

let user_local_storage = await get_local_storage({name: 'user'});

export const render = async () => {
	let template = create_element('div');
	template.classList.add('dashboard');
	let container = create_element('div');
	container.classList.add('container');
	
	async function sale_list() {
		let div = create_element('div');
		div.innerHTML = `
		<div class="container">
			<h3 class="section-title small">Lịch sử mua hàng</h3>
		</div>
		`;
		
		return div;
	}
	
	let get_info_requets = {
		url: bhdt_api + api_end_point.profile,
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		async callback(params) {
			template.appendChild(await dashboard_nav({
				local: user_local_storage,
				data: params
			}));
			container.appendChild(await sale_list(params));
			template.appendChild(container);
		}
	}
	fetch_data(get_info_requets);
	
	return template;
}