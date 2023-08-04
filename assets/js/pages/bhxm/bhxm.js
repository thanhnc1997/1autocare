import {
	create_element
} from '../../helper.js';


export const render = async (params) => {
	let {typeInsurance} = params;
	let template = create_element('div');
	
	if (typeInsurance === 'bao-hiem-xe-may-mic') {
		let block = await import('./bhxm_mic.js');
		template.appendChild(await block.render(params));
	}
	
	if (typeInsurance === 'bao-hiem-xe-may-pvi') {
		let block = await import('./bhxm_pvi.js');
		template.appendChild(await block.render(params));
	}
	
	return template;
}