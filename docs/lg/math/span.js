

        // ------------- Span Functions -------------------------

// An Interval Arithmetic Library, that somewhat effeciently represents
// simple "From To" linear/step intervals. For performance and simplicity reasons "From"
// is assumed to be less than or equal to "To", this is checked in numerous places.
// Standard Location: http://www.lewcid.com/lg/math/span.js 
// Project Homepage: http://www.lewcid.com/lg/math/ 
// By Lewey Geselowitz - http://www.lewcid.com/

// Example Usages:
//  Create a Span:  span(5,6)    : the span between 5 and 6 (toString results in 5~6)
//  Create a Span:  exactly(7)   : same as span(7,7)
//  Create a Span:  spanUnsorted(4,2)   : corrects to 2~4

//  Object Methods: span(1,2).times(exactly(3))            : gives 3~6
//  Global Methods: spanAdd(spanExactly(1),span(0.5,0.6))  : gives 1.5~1.6

        // Span Construction
		
		function spanType(_from,_to) {
			this.From = _from;
			this.To = _to;
		}

        function spanCheck(_s) {
            if ((!_s.hasOwnProperty('From')) || (!_s.hasOwnProperty('To'))) {
                throw ('Span is not configured correctly: ' + _s);
            }
            if (_s.To < _s.From) {
                throw ('Span is not sorted correctly: ' + _s);
            }
        }

        function span(_from,_to)
        {
			var ans = new spanType(_from,_to);
            spanCheck(ans);
            return ans;
        }

		function exactly(_a) {
			return span(_a,_a);
		}
		
		spanType.prototype.add = function(_a) {
				return spanAdd(this,_a);
		}

		spanType.prototype.minus = function(_a) {
				return spanSubtract(this,_a);
		}

		spanType.prototype.times = function(_a) {
				return spanMult(this,_a);
		}

		spanType.prototype.abs = function () {
		    return spanAbs(this);
		}
		
		spanType.prototype.contains = function(_a) {
				return spanContains(this,_a);
		}

		spanType.prototype.touches = function(_a) {
				return spanTouches(this,_a);
		}

		spanType.prototype.equals = function(_a) {
				return spanEquals(this,_a);
		}

		spanType.prototype.sqrt = function() {
				return spanSqrt(this);
		}

		spanType.prototype.cos = function() {
				return spanCos(this);
		}

		spanType.prototype.sin = function () {
		    return spanSin(this);
		}

		spanType.prototype.sine = function () {
		    return spanSin(this);
		}

		spanType.prototype.atan2 = function (_a) {
		    return spanAtan2(this,_a);
		}

		spanType.prototype.boundedBy = function (_a) {
		    return spanBounded(this, _a);
		}
		
		spanType.prototype.toString = function() {
				return "" + this.From + "~" + this.To;
		}
		


        function spanUnsorted(_a, _b)
        {
            if (_a <= _b) return span(_a, _b);
            else return span(_b, _a);
        }

        function spanAround(_v, _delta) {
            var ad = Math.abs(_delta);
            return span(_v - ad, _v + ad);
        }

        function spanExactly(_val) {
            return span(_val, _val);
        }

        function spanOffsetAndSize(_offset,_size)
        {
            return span(_offset, _offset + _size);
        }

        function spanFromInt(_ival)
        {
            return span(_ival, _ival + 1);
        }

        // Span Arithmetic

        function spanAdd(_sa, _sb)
        {
            spanCheck(_sa);
            spanCheck(_sb);
            return span(_sa.From + _sb.From, _sa.To + _sb.To);
        }

        function spanMult(_sa, _sb)
        {
            spanCheck(_sa);
            spanCheck(_sb);
            return spanUnsorted(_sa.From * _sb.From, _sa.To * _sb.To);
        }

        function spanNegative(_s) {
            spanCheck(_s);
            return span(-(_s.To), -(_s.From));
        }

        function spanSubtract(_sa, _sb) {
            spanCheck(_sa);
            spanCheck(_sb);
            return spanAdd(_sa, spanNegative(_sb));
        }

		function spanMagnitude(_sa, _val) {
			return spanSqrt(spanAdd(spanMult(_sa,_sa),spanMult(_val,_val)));
		}
		
        function spanContains(_sa, _val) {
            spanCheck(_sa);
            return ((_sa.From <= _val) && (_sa.To > _val));
        }

        function spanExactlyOneDividedBy(_sa) {
            spanCheck(_sa);
            if ((_sa.From < 0) && (_sa.To > 0)) {
                return span(1.0 / Math.min(_sa.From, _sa.To), 1.0 / 0.0);
            }
            return span(1.0 / _sa.To, 1.0 / _sa.From);
        }
		
		function spanTouches(_sa, _val) {
			spanCheck(_sa);
			spanCheck(_val);
			// TODO: test this:
			return (!((_sa.To < _val.From) || (_val.To < _sa.From)));
		}

		function spanEquals(_sa, _val) {
			// HACK FOR NOW:
			return spanTouches(_sa, _val);
        }

        function spanIncluding(_s, _val) {
            spanCheck(_s);
            return span(Math.min(_s.From, _val), Math.max(_s.To, _val));
        }

        function util_bounded(_a, _min, _max) {
            return Math.max(_min, Math.min(_max, _a));
        }

        function spanBounded(_sa, _val) {
            spanCheck(_sa);
            spanCheck(_val);
            return span(
                util_bounded(_sa.From, _val.From, _val.To),
                util_bounded(_sa.To, _val.From, _val.To));
        }

        function spanUnion(_sa, _sb) {
            return span(Math.min(_sa.From, _sb.From), Math.max(_sa.To, _sb.To));
        }

        function spanAnd(_sa, _sb) {
            return spanBounded(_sa, _sb); // for now
        }

        function spanOr(_sa, _sb) {
            return spanUnion(_sa, _sb);
        }

        function spanAbs(_s) {
            var pf = _s.From;
            if (pf >= 0) {
                return _s; // begining is positive, abs is the same
            } else {
                var pt = _s.To;
                if (pt <= 0) {
                    return span(-pt, -pf); // were both negative
                } else {
                    return span(0, Math.max(-pf, pt)); // crosses axes, include 0 in answer
                }
            }
        }

        function util_sqrtSigned(_val) {
            var sign = ((_val >= 0) ? 1.0 : -1.0);
            return Math.sqrt(_val * sign) * sign;
        }

        function spanSqrt(_s) {
            spanCheck(_s);
            return span(util_sqrtSigned(_s.From), util_sqrtSigned(_s.To));
        }

        function spanCos(_s) {
            spanCheck(_s);

            var ans = spanUnsorted(Math.cos(_s.From), Math.cos(_s.To));

            // TODO: Optimize, this walks through the critcal points ensuring they are in the interval:
            var cycleLength = Math.PI / 4.0;
            var unitFrom = _s.From / cycleLength;
            var unitTo = Math.min( _s.To / cycleLength, unitFrom + (cycleLength * 6) );
            while (Math.floor(unitFrom) < Math.floor(unitTo)) {
                unitFrom = Math.floor(unitFrom) + 1;
                var curVal = Math.cos(unitFrom * cycleLength);
                ans = spanIncluding(ans, curVal);
            }
            
            return ans;
        }

        function spanSin(_s) {
            spanCheck(_s);

            var ans = spanUnsorted(Math.sin(_s.From), Math.sin(_s.To));

            // TODO: Optimize, this walks through the critcal points ensuring they are in the interval:
            var cycleLength = Math.PI / 4.0;
            var unitFrom = _s.From / cycleLength;
            var unitTo = Math.min(_s.To / cycleLength, unitFrom + (cycleLength * 6));
            while (Math.floor(unitFrom) < Math.floor(unitTo)) {
                unitFrom = Math.floor(unitFrom) + 1;
                var curVal = Math.sin(unitFrom * cycleLength);
                ans = spanIncluding(ans, curVal);
            }

            return ans;
        }

        function spanAtan2(_sy, _sx) {
            var ff = Math.atan2(_sy.From, _sx.From);
            var ft = Math.atan2(_sy.From, _sx.To);
            var tt = Math.atan2(_sy.To, _sx.To);
            var tf = Math.atan2(_sy.To, _sx.From);
            return spanUnion(spanUnsorted(ff, ft), spanUnsorted(tt, tf));
        }

        // Seconday Span Functions:

        function spanLerp(_sa, _sb, _st) {
            var nst = exactly(1.0).minus(_st);
            return (_sa.times(nst).add(_sb.times(_st)));
        }

        function spanLerpSigned(_sa, _sb, _st) {
            return spanLerp(_sa, _sb, _st.times(exactly(0.5)).add(exactly(0.5)));
        }


        // Span Projections

        function spanProjCheck(_s) {
            if ((!_s.hasOwnProperty('From')) || (!_s.hasOwnProperty('To'))) {
                throw ('SpanProj is not configured correctly: ' + _s);
            }
            spanCheck(_s.From);
            spanCheck(_s.To);
        }

        function spanProjFromDomainAndRange(_sdomain, _srange)
        {
            spanCheck(_sdomain);
            spanCheck(_srange);
            var delta = (_srange.To - _srange.From) / (_sdomain.To - _sdomain.From);
            return span(spanExactly(_srange.From), spanExactly(delta));
        }

        function spanProjSpan(_sproj, _sindex) {
            spanProjCheck(_sproj);
            spanCheck(_sindex);
            return spanAdd(_sproj.From, spanMult(_sproj.To, _sindex));
        }

        function spanProjInt(_sproj, _intIndex)
        {
            return spanProjSpan(_sproj, spanFromInt(_intIndex));
        }

// Span Vector Functions 2D:

        function span2dType(_x,_y) {
            this.x = _x;
            this.y = _y;
        }

        function span2d(_x,_y) {
            var ans = new span2dType(_x, _y);
            spanCheck(_x);
            spanCheck(_y);
            return ans;
        }

        function span2dExactly(_x,_y) {
            return span2d(exactly(_x),exactly(_y));
        }

        function span2dSelect(_a, _b, _f) {
            var ix = _f(_a.x, _b.x);
            var iy = _f(_a.y, _b.y);
            return span2d(ix,iy);
        }

        span2dType.prototype.add = function (_a) {
            return span2dSelect(this, _a, spanAdd);
        }

        span2dType.prototype.minus = function (_a) {
            return span2dSelect(this, _a, spanSubtract);
        }

        span2dType.prototype.dot = function (_a) {
            return (this.x.times(_a.x).add(this.y.times(_a.y)));
        }

        span2dType.prototype.magnitude = function () {
            return this.dot(this).sqrt();
        }

        // Span Vector Functions 3D:

        function span3dType(_x, _y, _z) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
        }

        function span3d(_x, _y, _z) {
            var ans = new span3dType(_x, _y, _z);
            return ans;
        }

        function span3dUnit(_u) {
            return span3d(_u, _u, _u);
        }

        function span3dSelect(_a, _f) {
            return span3d(_f(_a.x), _f(_a.y), _f(_a.z));
        }

        function span3dSelectWith(_a, _b, _f) {
            return span3d(
                _f(_a.x, _b.x),
                _f(_a.y, _b.y),
                _f(_a.z, _b.z));
        }

        function span3dExactly(_x, _y, _z) {
            return span3dSelect(span3d(_x, _y, _z), exactly);
        }

        function span3dVectorScale(_a, _b) {
            return span3d(spanMult(_a.x, _b.x), spanMult(_a.y, _b.y), spanMult(_a.z, _b.z));
        }

        function span3dScalar(_s) {
            return span3d(_s, _s, _s);
        }

        function span3dSum(_a) {
            return _a.x.add(_a.y).add(_a.z);
        }

        function span3dProduct(_a) {
            return _a.x.times(_a.y).times(_a.z);
        }

        function span3dEquals(_a, _b) {
            var r = span3dSelectWith(_a, _b, spanEquals);
            return (r.x && r.y && r.z);
        }

        function span3dAnyEquals(_a,_b) {
            var r = span3dSelectWith(_a, _b, spanEquals);
            return (r.x || r.y || r.z);
        }

        function span3dAbs(_a) {
            return span3dSelect(_a, spanAbs);
        }

        span3dType.prototype.add = function (_a) {
            return span3dSelectWith(this, _a, spanAdd);
        }

        span3dType.prototype.minus = function (_a) {
            return span3dSelectWith(this, _a, spanSubtract);
        }

        span3dType.prototype.dot = function (_a) {
            return span3dSum(span3dVectorScale(this, _a));
        }

        span3dType.prototype.times = function (_a) {
            return span3dVectorScale(this, _a);
        }

        span3dType.prototype.scaled = function (_a) {
            return span3dVectorScale(this, span3dScalar(_a));
        }

        span3dType.prototype.product = function () {
            return span3dProduct(this);
        }

        span3dType.prototype.sum = function () {
            return span3dSum(this);
        }

        span3dType.prototype.equals = function (_a) {
            return span3dEquals(this, _a);
        }

        span3dType.prototype.anyEquals = function (_a) {
            return span3dAnyEquals(this, _a);
        }

        span3dType.prototype.abs = function () {
            return span3dAbs(this);
        }

        span3dType.prototype.cos = function () {
            return span3dSelect(this, spanCos);
        }

        span3dType.prototype.sin = function () {
            return span3dSelect(this, spanSin);
        }

        span3dType.prototype.magnitude = function () {
            return this.dot(this).sqrt();
        }

        // Span Vector Functions 4D:

        function span4dType(_x, _y, _z,_w) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
        }

        function span4d(_x, _y, _z, _w) {
            var ans = new span4dType(_x, _y, _z, _w);
            return ans;
        }

        function span4dSelect(_a, _f) {
            return span4d(_f(_a.x), _f(_a.y), _f(_a.z), _f(_a.w));
        }

        function span4dScaled(_a, _s) {
            return span4d(_a.x.times(_s), _a.y.times(_s), _a.z.times(_s), _a.w.times(_s));
        }

        function span4dSelectWith(_a, _b, _f) {
            return span4d(
                _f(_a.x, _b.x),
                _f(_a.y, _b.y),
                _f(_a.z, _b.z),
                _f(_a.w, _b.w));
        }

        span4dType.prototype.add = function (_a) {
            return span4dSelectWith(this, _a, spanAdd);
        }

        span4dType.prototype.minus = function (_a) {
            return span4dSelectWith(this, _a, spanSubtract);
        }

        span4dType.prototype.scaled = function (_a) {
            return span4dScaled(_a);
        }

        span4dType.prototype.dot = function (_a) {
            return (this.x.times(_a.x).add(this.y.times(_a.y)).add(this.z.times(_a.z)).add(this.w.times(_a.w)));
        }

        span4dType.prototype.magnitude = function () {
            return this.dot(this).sqrt();
        }

        // Span Matrix Functions 4x4D:

        //function span4x4dType(_x, _y, _z, _w) {
        //    this.x = _x;
        //    this.y = _y;
        //    this.z = _z;
        //    this.w = _w;
        //}

        //function span4x4d(_x, _y, _z, _w) { return span4d(_x, _y, _z, _w); }

        function span4x4dType(_x, _y, _z, _w) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
        }

        function span4x4d(_x, _y, _z, _w) {
            var ans = new span4x4dType(_x, _y, _z, _w);
            return ans;
        }

        function span4x4dSelect(_mat, f) {
            return span4x4d(f(_mat.x), f(_mat.y), f(_mat.z), f(_mat.w));
        }

        function span4x4dMultiplyPoint(_mat, _pnt) {
            return span4d(
                _mat.x.dot(_pnt),
                _mat.y.dot(_pnt),
                _mat.z.dot(_pnt),
                _mat.w.dot(_pnt));
        }

        function span4x4dConcatenate(_a, _b) {
            return span4x4dSelect(_a, function (v) { return span4x4dMultiplyPoint(_b, v); });
        }

        function span4x4dScaling(scale) {
            var e0 = exactly(0);
            var e1 = scale;
            return span4x4d(
                span4d(e1, e0, e0, e0),
                span4d(e0, e1, e0, e0),
                span4d(e0, e0, e1, e0),
                span4d(e0, e0, e0, e1));
        }

        function span4x4dIdentity() {
            return span4x4dScaling(exactly(1));
        }

        function span4x4dRotateZ(_a) {
            var cs = _a.cos();
            var sp = _a.sin();
            var sn = spanNegative(sp);
            var e0 = exactly(0);
            var e1 = exactly(1);
            return span4x4d(
                span4d(cs, sp, e0, e0),
                span4d(sn, cs, e0, e0),
                span4d(e0, e0, e1, e0),
                span4d(e0, e0, e0, e1));
        }

        function span4x4dRotateX(_a) {
            var cs = _a.cos();
            var sp = _a.sin();
            var sn = spanNegative(sp);
            var e0 = exactly(0);
            var e1 = exactly(1);
            return span4x4d(
                span4d(e1, e0, e0, e0),
                span4d(e0, cs, sp, e0),
                span4d(e0, sn, cs, e0),
                span4d(e0, e0, e0, e1));
        }

        function span4x4dRotateY(_a) {
            var cs = _a.cos();
            var sp = _a.sin();
            var sn = spanNegative(sp);
            var e0 = exactly(0);
            var e1 = exactly(1);
            return span4x4d(
                span4d(cs, e0, sp, e0),
                span4d(e0, e1, e0, e0),
                span4d(sn, e0, cs, e0),
                span4d(e0, e0, e0, e1));
        }




        // Span Color Functions

        function spanColorRgbToStyle(r, g, b) {
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        function spanColorSignedForGreen(v) {
            return v.boundedBy(span(-1.0, 1.0)).times(exactly(Math.PI)).cos().times(exactly(0.5)).add(exactly(0.5));
        }

        function spanColorSignedForRed(v) {
            return spanColorSignedForGreen(v.add(exactly(-0.5)).times(exactly(1.0)));
        }

        function spanColorSignedForBlue(v) {
            return spanColorSignedForGreen(v.add(exactly(0.5)).times(exactly(1.0)));
        }

        function spanColorSignedTo255(_sa) {
            var s = _sa.times(exactly(255.0));
            return Math.floor(s.To); //(s.To + s.From)*0.5);
        }

        function spanColor(_a) {
            var g = spanColorSignedTo255(spanColorSignedForGreen(_a));
            var r = spanColorSignedTo255(spanColorSignedForRed(_a));
            var b = spanColorSignedTo255(spanColorSignedForBlue(_a));
            return spanColorRgbToStyle(r, g, b);
        }


        // ------------- End of Span Functions -------------------------
