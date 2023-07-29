import Link from "next/link";
import Image from "next/image";

export default function CollectionIcon({ collection, size }) {
	return (
		<>
			{collection?._id && (
				<Link
					href={`/collection/${collection._id}`}
					key={collection._id}
				>
					<a>
						<div
							className={`rounded-full h-[25px] w-[25px] duration-200 transition hover:scale-110 relative ${
								size == "lg" && `h-[40px] w-[40px]`
							}`}
						>
							{collection.image_url && (
								<Image
									src={collection.image_url}
									className="h-full w-full rounded-full"
									alt=""
									layout="fill"
									objectFit="cover"
								/>
							)}
						</div>
					</a>
				</Link>
			)}
		</>
	);
}
