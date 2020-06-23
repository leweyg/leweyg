
// Lewid (LCD) Kernel

var lewcidKernel = {
    ThreadStruct : [
        "offset_register_ptr",
        "offset_instruction_ptr",
        "offset_stack_ptr",
        "offset_heap_ptr",
    ],
    StackCodes : [
        {id:"nop"},
        {id:"kernel_init"},
        {id:"kernel_main"},
        {id:"kernel_return"},
        {id:"push_i"}, // #
        {id:"push"}, // src
        {id:"pop"}, // dst
        {id:"peek"}, // dst
        {id:"var"}, // id, initial
    ],
    Test:{
        StackSource : [
            "var row",
            "var col",
            "push_i 0",
            "push_i 1",
            "pop row",
            "peek col",
            "push row",
            "push col",
        ],
    },
    MicroRegisters : [
        "r_zero",
        "r_thread",
        "r_ins_ptr",
        "r_stack_ptr",
        "r_reg_ptr",
        "r_op_code",
        "r_temp_0",
        "r_temp_regid"
    ],
    MicroOps : [
        "nop", // no operation { }
        "kernel_flush",
        "label", // label
        "thread_ptr_read", // dst = thread_ptr
        "read", // dst = [ src + offset ]
        "write", // [ src + offset ] = dst
        "add", // dst = [ src + # ]
        "adde", // dst += #
        "jump", // ins_ptr = dst
        "jump_if", // if (src == #) ins_ptr = dst
        "jump_op", // ins_ptr = @dst
    ],
    MicroSource : [
        "@ kernel_init",

        // read current instruction:
        "thread_ptr_read r_thread",
        "read r_ins_ptr, r_thread, offset_instruction_ptr",
        "read r_stack_ptr, r_thread, offset_stack_ptr",
        "read r_reg_ptr, r_thread, offset_register_ptr",

        // read instruction and jump to it:
        "@ kernel_main",
        "read r_op_code, r_ins_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "jump_op r_op_code", // goto label below

        // return statement:
        "@ kernel_return",
        "write r_ins_ptr, r_thread, offset_instruction_ptr",
        "write r_stack_ptr, r_thread, offset_stack_ptr",
        "kernel_flush",
        "jump @kernel_main",

        // push immediate
        "@ push_i",
        "read r_temp_0, r_ins_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "write r_temp_0, r_stack_ptr, 0", // write
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // pop register
        "@ pop",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, 0", // read
        "write r_temp_0, r_temp_regid", // write
        "add r_stack_ptr, r_stack_ptr, -1",
        "jump @kernel_return",

        // push register
        "@ push",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_temp_regid", // read
        "write r_temp_0, r_stack_ptr, 0", // write
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // peek register
        "@ peek",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, 0", // read
        "write r_temp_0, r_temp_regid", // write
        //"add r_stack_ptr, r_stack_ptr, 1", // dont move stack
        "jump @kernel_return",

        // return
    ],
    MicroAssembly : null,
};

var lewcidCompiler = {
    indexIn : function (name,array) {
        for (var i in array) {
            var k = array[i];
            if (k == name)
                return i;
        }
        throw "Unknown item '" + name + "'";
    },
    tokenize : function (str) {
        var parts = str.split(" ");
        var result = [];
        for (var pi in parts) {
            var p = parts[pi].replace(",","").trim();
            if (p != "")
                result.push(p);
        }
        return result;
    },
};

function lewcidKernel_EnsureCompiled_Kernel() {
    var kernel = lewcidKernel;
    if (kernel.MicroAssembly)
        return kernel;
    kernel.MicroAssembly = [];
    function stackcode_by_name(name) {
        for (var i in kernel.StackCodes) {
            var code = kernel.StackCodes[i];
            code.index = i; // TODO: pre-store this
            if (code.id == name)
                return code;
        }
        throw "unknown stack code '" + name + "'";
    }
    var indexIn = lewcidCompiler.indexIn;
    var tokenize = lewcidCompiler.tokenize;
    for (var lineIndex in kernel.MicroSource) {
        var line = kernel.MicroSource[lineIndex];
        var parts = tokenize(line);
        if (parts[0] == "@") {
            var code = stackcode_by_name(parts[1]);
            code.offset = kernel.MicroAssembly.length;
            continue;
        }
        var r_op_code = indexIn( parts[0], kernel.MicroOps );
        var r_op_dst = 0;
        if (parts.length >= 2) {
            if (parts[1].startsWith("@")) {
                r_op_dst = stackcode_by_name(parts[1].substr(1)).offset;
                console.assert( r_op_dst );
            } else {
                r_op_dst = indexIn( parts[1], kernel.MicroRegisters );
                console.assert( r_op_dst );
            }
        }
        var r_op_src = 0;
        if (parts.length >= 3)
            r_op_src = indexIn( parts[2], kernel.MicroRegisters );
        var r_op_const = 0;
        if (parts.length >= 4) {
            if (!isNaN(parts[3])) {
                r_op_const = 1*parts[3];
            } else {
                r_op_const = indexIn( parts[3], kernel.ThreadStruct );
            }
        }

        kernel.MicroAssembly.push( 1*r_op_code );
        kernel.MicroAssembly.push( 1*r_op_dst );
        kernel.MicroAssembly.push( 1*r_op_src );
        kernel.MicroAssembly.push( 1*r_op_const );
    }
    return kernel;
}

function lewcidKernel_Compile_StackSource(source) {
    var kernel = lewcidKernel;

}

function lewcidKernel_EnsureCompiled() {
    var kernel = lewcidKernel_EnsureCompiled_Kernel();
    lewcidKernel_Compile_StackSource(lewcidKernel.Test.StackSource);
    console.log(JSON.stringify(kernel));
}

lewcidKernel_EnsureCompiled();




