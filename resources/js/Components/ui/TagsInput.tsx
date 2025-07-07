import React, { useState, useEffect } from 'react';
import { WithContext as ReactTags, Tag } from 'react-tag-input';

// Define keycodes for separators
const KeyCodes = {
	comma: 188,
	enter: 13,
};

// Use comma and Enter to delimit tags
const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface TagInputProps {
	/** Optional initial tags */
	initialTags?: Tag[];
	onTagsChange?: (tags: Tag[]) => void;
}

export default function TagsInput({ initialTags = [], onTagsChange }: TagInputProps) {
	const [tags, setTags] = useState<Tag[]>(initialTags);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		onTagsChange?.(tags);
	}, [tags, onTagsChange]);

	// Add only if fewer than 3 tags
	const handleAddition = (tag: Tag) => {
		if (tags.length >= 3) {
			setError('You can add up to 3 tags only.');
			return;
		}
		setTags([...tags, tag]);
		setError('');
	};

	const handleDelete = (i: number) => {
		setTags(tags.filter((_, index) => index !== i));
		setError('');
	};

	const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
		const newTags = [...tags];
		newTags.splice(currPos, 1);
		newTags.splice(newPos, 0, tag);
		setTags(newTags);
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<ReactTags
				tags={tags}
				delimiters={delimiters}
				handleDelete={handleDelete}
				handleAddition={handleAddition}
				allowDragDrop={false}
				autocomplete
				placeholder="Type and press enter"
				classNames={{
					tags: 'px-2 pt-2 pb-11 mb-3 flex flex-wrap',
					tag: 'flex flex-wrap pl-4 pr-2 py-2 m-1 justify-between items-center text-sm font-medium rounded-xl cursor-pointer bg-firefly-500 text-gray-200 hover:bg-firefly-600 hover:text-gray-100',
					remove: 'ml-2 cursor-pointer',
					activeSuggestion: 'bg-gray-200',
					tagInputField: 'mt-1 py-3 px-5 w-full border-2 border-purple-300 rounded-2xl outline-none placeholder:text-gray-400 invalid:text-pink-700 invalid:focus:ring-pink-700 invalid:focus:border-pink-700 peer dark:bg-gray-500 dark:text-gray-200 dark:placeholder:text-gray-300 dark:invalid:text-pink-300 dark:border-gray-400',
				}}
			/>
			{error && (
				<p className="mt-2 text-sm text-red-600">{error}</p>
			)}
		</div>
	);
}
