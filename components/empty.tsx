import Image from "next/image";

interface EmptyProps {
    label: string;
}

export const Empty = ({ label }: EmptyProps) => {
    return (
        <div className="h-60 w-full flex flex-col items-center justify-center"> {/* Container height remains the same */}
            <div className="relative h-64 w-64"> {/* Further increased height and width for the image */}
                <Image 
                    alt="Empty"
                    fill
                    src="/empty.png"
                    className="object-contain" // Ensure the image is contained properly
                />
            </div>
            <p className="mt-4 text-gray-500">{label}</p> 
        </div>
    );
};
