import {
	create_element,
	get_local_storage,
	bhdt_api,
	api_end_point,
	fetch_data,
	format_price,
	status_vietsub,
	render_icon,
	loader,
	remove_loader
} from '../../../helper.js';

export const render = async (params) => {
	let {order_id, user_local_storage, data} = params;
	let {typeInsurance} = data.data;
	
	let template = create_element('section');
	let container = create_element('div');
	container.classList.add('container');
	
	if (typeInsurance == 'bao-hiem-xe-may-mic') {
		let block = await import('./order_type/mic_xe_may_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}
	
	if (typeInsurance == 'bao-hiem-xe-may-pvi') {
		let block = await import('./order_type/pvi_xe_may_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}
	
	if (typeInsurance == 'bao-hiem-xe-oto-pvi') {
		let block = await import('./order_type/pvi_oto_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}
	
	if (typeInsurance == 'bao-hiem-tnds-xe-oto-mic') {
		let block = await import('./order_type/mic_oto_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}
	
	if (typeInsurance == 'bao-hiem-du-lich-toan-cau-mic') {
		let block = await import('./order_type/dlqt_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}

	if (typeInsurance == 'bao-hiem-du-lich-trong-nuoc-mic') {
		let block = await import('./order_type/dltn_type.js');
		container.appendChild(await block.render({
			data: data.data,
			user_local_storage: user_local_storage,
			order_id: order_id
		}));
	}
	
	template.appendChild(await container);
	
	return template;
}