
// Lewid (LCD) Kernel

var lewcidKernel = {
    ThreadStruct : [
        "offset_register_ptr",
        "offset_instruction_ptr",
        "offset_stack_ptr",
        "offset_heap_ptr",
    ],
    StackCodes : [
        {id:"push_i"}, // #
        {id:"push"}, // src
        {id:"pop"}, // dst
    ],
    MicroRegisters : [
        "r_thread",
        "r_ins_ptr",
        "r_stack_ptr",
        "r_reg_ptr",
        "r_op_code",
        "r_op_dst",
        "r_op_src",
        "r_op_const",
        "r_temp_0",
    ],
    MicroOps : [
        "nop", // no operation { }
        "label", // label
        "thread_ptr_read", // dst = thread_ptr
        "read", // dst = [ src + offset ]
        "write", // [ src + offset ] = dst
        "add", // dst = [ src + # ]
        "adde", // dst += #
        "jump", // ins_ptr = dst
        "jump_if", // if (src == #) ins_ptr = dst
        "jump_op", // ins_ptr = @dst
        "flush",
    ],
    MicroSource : [
        "@ kernel_main",
        "thread_ptr_read r_thread",

        // read current instruction:
        "read r_ins_ptr, r_thread, offset_instruction_ptr",
        "read r_stack_ptr, r_thread, offset_stack_ptr",
        "read r_reg_ptr, r_thread, offset_register_ptr",
        "read r_op_code, r_ins_ptr, 0",
        "read r_op_dst, r_ins_ptr, 1",
        "read r_op_src, r_ins_ptr, 2",
        "read r_op_const, r_ins_ptr, 3",

        // move instruction pointer forward:
        "add r_ins_ptr, r_ins_ptr, 4",
        "write r_ins_ptr, r_thread, offset_instruction_ptr",
        "jump_op r_op_code", // goto label below

        "@ push_i",
        "write r_op_const, r_stack_ptr, 0",
        "adde r_stack_ptr, 1",
        "write r_stack_ptr, r_thread, offset_stack_ptr",
        "jump @kernel_return",

        "@ push",
        "read r_temp_0, r_reg_ptr, r_op_src",
        "write r_op_src, r_stack_ptr, 0",
        "adde r_stack_ptr, 1",
        "write r_stack_ptr, r_thread, offset_stack_ptr",
        "jump @kernel_return",

        "@ kernel_return",
        "flush",
        // return
    ],
    MicroAssembly : null,
};

function lewcidKernel_EnsureCompiled() {
    var kernel = lewcidKernel;
    if (kernel.MicroAssembly)
        return kernel;
    kernel.MicroAssembly = [];
    for (var lineIndex in kernel.MicroSource) {
        var line = kernel.MicroSource[lineIndex];
        var parts = line.split(" ");
        for (var pi in parts) {

        }
    }
}

lewcidKernel_EnsureCompiled();



