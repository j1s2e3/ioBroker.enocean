class ByteArray extends Array {
	set(arr, offset = 0) {
		const tmp = ByteArray.from(arr);
		if (tmp.length === 0) return;
		this.splice(offset, tmp.length, ...tmp);
	}

	/**
	 *
	 * @param {number} bitOffset - set bit offset where to start
	 * @param {number} bitLength - set the length of the data
	 * @returns {number}
	 */
	getValue(bitOffset, bitLength) {
		if (bitLength === 0) return 0;
		return parseInt(this.toString(2).substr(bitOffset, bitLength), 2);
	}

	/**
	 *
	 * @param {number} value
	 * @param {number} offset
	 * @param {number} bitLength
	 * @returns {ByteArray}
	 */
	setValue(value, offset, bitLength) {
		if(typeof offset === 'string') offset = parseInt(offset);
		if(typeof bitLength === 'string') bitLength = parseInt(bitLength);
		const bits = value.toString(2).padStart(bitLength, '0');
		for (let i = 0; i < bits.length; i++) {
			this.setSingleBit(offset + i, parseInt(bits[i]));
		}
		return this;
	}

	/**
	 *
	 * @param offset
	 * @param value
	 * @returns {ByteArray}
	 */
	setSingleBit(offset, value) {
		const byte = (offset - (offset % 8)) / 8;
		const offsetInByte = offset % 8;
		const mask = 1 << 7 - parseInt(offsetInByte.toString());
		value === 1 ? this[byte] |= mask : this[byte] &= ~mask;
		return this;
	}

	getSingleBit(offset) {
		const byte = (offset - (offset % 8)) / 8;
		const offsetInByte = offset % 8;
		const mask = 1 << 7 - parseInt(offsetInByte.toString());
		if ((this[byte] & mask) !== 0) {
			return 1;
		} else {
			return 0;
		}
	}

	toString(radix = 16) {
		switch (radix) {
			case 'bin':
			case 2:
				return this.map(item => item.toString(2).padStart(8, '0')).join('');
			case 'dec':
			case 10:
				return this.map(item => item.toString(10).padStart(3, '0')).join('');
			case 'hex':
			case 16:
				return this.map(item => item.toString(16).padStart(2, '0')).join('');
		}
	}
}
ByteArray.from = function (...args) {
	const tmp = [];
	args.forEach(item => {
		if (Number.isInteger(item) && item <= 255) {
			tmp.push(item);
		}
		if (Number.isInteger(item) && item > 255) {
			const t3 = ByteArray.from(item.toString(16));
			t3.forEach(x => {
				tmp.push(x);
			});
		}
		if (typeof item === 'string') {
			if (!/^[0-9abcdef]*$/.test(item)) {
				item.split('').forEach(x => {
					tmp.push(x.charCodeAt(0));
				});
				// throw new Error('String MAY only contain "0-9 a b c d e f"')
			} else {
				if (item.length % 2 !== 0) {
					item = `0${item}`;
				}
				((item.match(/.{1,2}/g) || []).map(item => parseInt(item, 16))).forEach(x => {
					tmp.push(x);
				});
			}
		}
		if (Array.isArray(item)) {
			const t2 = ByteArray.from(...item);
			t2.forEach(x => {
				tmp.push(x);
			});
		}
	});
	if (tmp.length === 1) {
		const res = new ByteArray();
		res[0] = tmp[0];
		return res;
	} else {
		return new ByteArray(...tmp);
	}
};


module.exports = {
	from: ByteArray.from
};
