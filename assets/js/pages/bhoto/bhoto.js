import {
	create_element
} from '../../helper.js';

export const render = async (params) => {
	let {typeInsurance} = params;
	let template = create_element('div');
	
	if (typeInsurance === 'bao-hiem-tnds-xe-oto-mic') {
		let block = await import('./bhoto_mic.js');
		template.appendChild(await block.render(params));
	}
	
	if (typeInsurance === 'bao-hiem-xe-oto-pvi') {
		let block = await import('./bhoto_pvi.js');
		template.appendChild(await block.render(params));
	}
	
	return template;
}