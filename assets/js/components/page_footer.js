import {
	create_element
} from '../helper.js';

export default async function page_footer() {
	let div = create_element('footer');
	div.classList.add('footer');
	div.innerHTML = `
	<div class="container">
		<div>
			<p class="mb-14"><a style="font-weight: 500; color: #000;" href="#">Điều khoản sử dụng</a></p>
			<p style="font-weight: 500; color: #000;" class="mb-14">© 2023 1Auto Care.</p>
		</div>
		<div>
			<h4 style="font-weight: 500; color: #000;" class="mb-14">Sản phẩm bảo hiểm MIC</h4>
			<p class="mb-8">
				<a href="/product/id=bao-hiem-tnds-xe-oto-mic">TNDS Ô tô</a>
			</p>
			<p class="mb-8">
				<a href="/product/id=bao-hiem-xe-may-mic">TNDS Mô tô</a>
			</p>
		</div>
		<div>
			<h4 style="font-weight: 500; color: #000;" class="mb-14">Sản phẩm bảo hiểm PVI</h4>
			<p class="mb-8">
				<a href="/product/id=bao-hiem-xe-may-pvi">TNDS Mô tô</a>
			</p>
			<p class="mb-8">
				<a href="/product/id=bao-hiem-xe-oto-pvi">TNDS Ô tô</a>
			</p>
		</div>
		<div>
			<h4 style="font-weight: 500; color: #000;" class="mb-14">Liên hệ</h4>
			<p class="mb-8">
				<a href="tel:+84 866 787 939">+84 (0) 866 787 939</a>
			</p>
			<p class="mb-8">
				<a href="mailto:info@1autocare.vn">info@1autocare.vn</a>
			</p>
			<p class="mb-8">
				Số 10 đường 14, P. Phú Mỹ, Q.7, TP.HCM
			</p>
		</div>
	</div>
	`;
	
	return div;
}