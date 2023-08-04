import {
	create_element,
	render_icon,
	toast,
	preview_image,
	checkbox_toggle
} from '../../helper.js';

let icon_settings = {
	arrow_left: {
		width: 18,
		height: 10,
		fill: '#333',
		stroke_width: 1.5
	},
	arrow_right: {
		width: 18,
		height: 10,
		fill: '#fff',
		stroke_width: 1.5
	},
}

export const render = async (params) => {
	let template = create_element('div');
	template.classList.add('form');
	
	async function change_step(steps) {
		let {current, next} = steps;
		if (current) {
			template.querySelector(`[data-id="${current}"]`).classList.remove('active');
			template.querySelector(current).classList.remove('show');
		}
		if (next) {
			template.querySelector(`[data-id="${next}"]`).classList.add('active');
			template.querySelector(next).classList.add('show');
		}
		window.scrollTo({top: 0});
	}
	
	async function process_section() {
		let div = create_element('div');
		div.classList.add('process-row', 'mb-24');
		div.innerHTML = `
		<div class="d-flex">
			<div data-id="#step_1" class="item active">
				<span class="number">1</span>
				<p>Thông tin <br><span>Xe được bảo hiểm</span></p>
			</div>
			<div data-id="#step_2" class="item">
				<span class="number">2</span>
				<p>Thông tin <br><span>Người mua bảo hiểm</span></p>
			</div>
			<div data-id="#step_3" class="item">
				<span class="number">3</span>
				<p>Thông tin <br><span>Thanh toán</span></p>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function step_1() {
		let div = create_element('div');
		div.setAttribute('id', 'step_1');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<label for="use_paper_1" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_1" type="checkbox" class="mr-6" name="toggle_1">
			<b>Dùng ảnh giấy đăng kiểm xe để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row image-row-1" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image">
				</div>
			</div>
		</div>
		
		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Loại hình</span>
				<select class="select" name="business_type">
					<option value="" selected>Kinh doanh</option>
					<option value="">Không kinh doanh</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Mục đích sử dụng</span>
				<select class="select" name="uses">
					<option value="" selected>Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Loại hình xe</span>
				<select class="select" name="vehicle_type">
					<option value="">Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Hãng sản xuất</span>
				<select class="select" name="brands">
					<option value="" selected>Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Dòng xe</span>
				<select class="select" name="models">
					<option value="" selected>Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Năm sản xuất</span>
				<input type="text" class="input" name="released" placeholder="Năm sản xuất">
			</div>

			<div class="col-md-3 mb-14">
				<span class="label required">Số chỗ ngồi</span>
				<input type="text" class="input" name="seats" placeholder="Số chỗ">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Tải trọng (tấn)</span>
				<input type="text" class="input" name="weight" placeholder="Tải trọng" disabled>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Ngày bắt đầu mua</span>
				<input type="date" class="input" name="start_date">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Thời hạn bảo hiểm</span>
				<select class="select" name="insurance_period">
					<option value="" selected>Chọn</option>
				</select>
			</div>
		</div>

		<p class="mb-14 note cursor-pointer d-flex align-items-center">
			<b>Phạm vi bảo hiểm (Mức khấu trừ 500.000 VND)</b>
		</p>
			
		<div class="mb-14">
			<h4>Trừ những trường hợp tổn thất thuộc điểm loại trừ của Quy tắc bảo hiểm, Bảo hiểm bồi thường cho những thiệt hại liên quan đến Xe được bảo hiểm phát sinh bởi:</h4>
			<p>- Đâm, va (bao gồm cả va chạm với vật thể khác ngoài xe cơ giới), lật, đổ, rơi, chìm, bị các vật thể khác rơi vào</p>
			<p>- Hỏa hoạn, cháy nổ</p>
			<p>- Mất toàn bộ xe do trộm, cướp</p>
			<p>- Những phí phát sinh hợp lý khác</p>
			<hr>
			<label class="label cursor-pointer" for="bhmcbp">
				<input class="mr-6" type="checkbox" id="bhmcbp" name="bhmcbp">
				<span>Bảo hiểm mất cắp bộ phận</span>
			</label>
			<label class="label cursor-pointer" for="kkhptvttm">
				<input class="mr-6" type="checkbox" id="kkhptvttm" name="kkhptvttm">
				<span>Không khấu hao phụ tùng vật tư thay mới</span>
			</label>
			<label class="label cursor-pointer" for="bhlccsscch">
				<input class="mr-6" type="checkbox" id="bhlccsscch" name="bhlccsscch">
				<span>Bảo hiểm lựa chọn cơ sở sửa chữa chính hãng</span>
			</label>
			<label class="label cursor-pointer" for="mtn">
				<input class="mr-6" type="checkbox" id="mtn" name="mtn">
				<span>Mua tự nguyện (Tai nạn lái, phụ xe & người ngồi trên xe)</span>
			</label>
			<label class="label cursor-pointer" for="bhthdcdtk">
				<input class="mr-6" type="checkbox" id="bhthdcdtk" name="bhthdcdtk">
				<span>Bảo hiểm thiệt hại động cơ do thủy kích</span>
			</label>
		</div>
		

		<label for="voluntary_buying" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="voluntary_buying" type="checkbox" class="mr-6" name="toggle_2">
			<b>Mua tự nguyện (Tai nạn lái, phụ xe & người ngồi trên xe)</b>
		</label>

		<div class="row row-toggle-2 mb-14" style="display: none;">
			<div class="col-md-3 mb-14">
				<span class="label required">Số người lái (phụ xe)</span>
				<select class="select" name="drivers">
					<option value="">Chọn</option>
				</select>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Mức tai nạn người lái (phụ xe)</span>
				<select class="select" name="accident_level">
					<option value="" selected>Chọn</option>
				</select>
			</div>
		</div>

		<label for="binding_buying" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="binding_buying" type="checkbox" class="mr-6" name="toggle_3">
			<b>Bảo hiểm bắt buộc TNDS của chủ xe cơ giới</b>
		</label>

		<div class="row-toggle-3 mb-14" style="display: none;">
			<h4>Quyền lợi bảo hiểm</h4>
			<p>- Với thiệt hại về người: 150.000.000 VNĐ/ người/ vụ tai nạn</p>
			<p>- Với thiệt hại về tài sản: 100.000.000 VNĐ/ vụ tai nạn</p>
		</div>
		
		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14">0VND</h3>
			<em class="text-secondary">(đã bao gồm VAT)</em>
		</div>
		
		<button class="btn btn-cyan mr-14">Tính phí</button>
		<button class="btn btn-primary">
			<span class="mr-6">Bước tiếp</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		let radios = div.querySelectorAll('input[type="radio"]');
		
		let next_step = div.querySelector('.btn-primary');
		next_step.addEventListener('click', async () => {
			await change_step({current: '#step_1', next: '#step_2'});
		});
		
		await checkbox_toggle(div.querySelector('input[name="toggle_1"]'), div.querySelector('.image-row-1'), 'flex');
		await checkbox_toggle(div.querySelector('input[name="toggle_2"]'), div.querySelector('.row-toggle-2'), 'flex');
		await checkbox_toggle(div.querySelector('input[name="toggle_3"]'), div.querySelector('.row-toggle-3'), 'block');
		
		await preview_image({
			preview: div.querySelector('input[name="front_image"]').parentElement,
			input: div.querySelector('input[name="front_image"]')
		});
		
		return div;
	}
	
	async function step_2() {
		let div = create_element('div');
		div.setAttribute('id', 'step_2');
		div.classList.add('tab-pane');
		div.innerHTML = `
		<label for="use_paper_2" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_2" type="checkbox" class="mr-6">
			<b>Dùng ảnh giấy đăng ký xe để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image">
				</div>
			</div>
			<div class="mb-14">
				<span class="label required">Ảnh mặt sau</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="back_image">
				</div>
			</div>
		</div>
		
		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Tên chủ xe đăng ký</span>
				<input class="input" type="text" name="beneficiary_full_name" placeholder="Tên chủ xe đăng ký">
			</div>
			<div class="col-md-8 mb-14">
				<span class="label required">Địa chỉ đăng ký</span>
				<input class="input" type="text" name="beneficiary_address" placeholder="Địa chỉ đăng ký">
			</div>
		</div>

		<div class="d-flex align-items-center mb-14">
			<label for="motor_type_1" class="label cursor-pointer d-flex align-items-center mr-14">
				<input id="motor_type_1" class="mr-6" type="radio" name="motor_type" checked>
				<span>Xe đã có biển kiểm soát</span>
			</label>
			<label for="motor_type_2" class="label cursor-pointer d-flex align-items-center">
				<input id="motor_type_2" class="mr-6" type="radio" name="motor_type">
				<span>Xe chưa có biển kiểm soát</span>
			</label>
		</div>

		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Biển kiểm soát</span>
				<input type="text" class="input" name="license_plate" placeholder="Biển kiểm soát">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Số khung</span>
				<input type="text" class="input" name="frame_number" placeholder="Số khung">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Số máy</span>
				<input type="text" class="input" name="machine_number" placeholder="Số máy">
			</div>
		</div>
		
		<button class="btn btn-secondary mr-14">
			${render_icon.arrow_left(icon_settings.arrow_left)} 
			<span class="ml-6">Quay lại</span>
		</button>
		<button class="btn btn-primary">
			<span class="mr-6">Bước tiếp</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		
		let radios = div.querySelectorAll('input[type="radio"]');
		
		checkbox_toggle(div.querySelector('input[type="checkbox"]'), div.querySelector('.image-row'), 'flex');
		
		radios.forEach(radio => {
			radio.addEventListener('change', (e) => {
				if (e.target.checked && e.target.getAttribute('id') === 'motor_type_2') {
					div.querySelector('input[name="license_plate"]').disabled = true;
				}
				else {
					div.querySelector('input[name="license_plate"]').disabled = false;
				}
			})
		});
		
		let next_step = div.querySelector('.btn-primary'),
				previous_step = div.querySelector('.btn-secondary');
		
		previous_step.addEventListener('click', async () => {
			change_step({current: '#step_2', next: '#step_1'});
		});
		
		next_step.addEventListener('click', async () => {
			change_step({current: '#step_2', next: '#step_3'});
		});
		
		await preview_image({
			preview: div.querySelector('input[name="front_image"]').parentElement,
			input: div.querySelector('input[name="front_image"]')
		});
		
		await preview_image({
			preview: div.querySelector('input[name="back_image"]').parentElement,
			input: div.querySelector('input[name="back_image"]')
		});
		
		return div;
	}
	
	async function step_3() {
		let div = create_element('div');
		div.setAttribute('id', 'step_3');
		div.classList.add('tab-pane');
		div.innerHTML = `
		<label for="use_paper_3" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_3" type="checkbox" class="mr-6">
			<b>Dùng ảnh CMT/CCCD để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image">
				</div>
			</div>
			<div class="mb-14">
				<span class="label required">Ảnh mặt sau</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="back_image">
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Tên người mua</span>
				<input type="text" class="input" name="buyer_full_name" placeholder="Họ & tên">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">SĐT</span>
				<input type="tel" class="input" name="buyer_phone_number" placeholder="SĐT">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Số CMT/CCCD</span>
				<input type="text" class="input" name="buyer_id" placeholder="Số CMT/CCCD">
			</div>
		</div>

		<button class="btn btn-secondary mr-14">
			${render_icon.arrow_left(icon_settings.arrow_left)} 
			<span class="ml-6">Quay lại</span>
		</button>
		<button class="btn btn-primary">
			<span class="mr-6">Hoàn tất</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		
		let previous_step = div.querySelector('.btn-secondary');
		
		previous_step.addEventListener('click', async () => {
			change_step({current: '#step_3', next: '#step_2'});
		});
		
		checkbox_toggle(div.querySelector('input[type="checkbox"]'), div.querySelector('.image-row'), 'flex');
		
		await preview_image({
			preview: div.querySelector('input[name="front_image"]').parentElement,
			input: div.querySelector('input[name="front_image"]')
		});
		
		await preview_image({
			preview: div.querySelector('input[name="back_image"]').parentElement,
			input: div.querySelector('input[name="back_image"]')
		});
		
		return div;
	}
	
	template.appendChild(await process_section());
	template.appendChild(await step_1());
	template.appendChild(await step_2());
	template.appendChild(await step_3());
	
	return template;
}