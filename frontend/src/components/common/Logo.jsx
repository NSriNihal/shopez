function Logo({ size = 9 }) {
    const sizeClass = size === 12 ? "h-12 w-12 text-lg" : "h-9 w-9"
    return (
        <div className={`${sizeClass} rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold`}>
            S
        </div>
    )
}

export default Logo
