import { NullBuffer } from '$lib/models/buffer.model';
import type { Pane } from '$lib/models/pane.model.svelte';
import ChapterContainer from '../../routes/(bible)/bible/components/chapter/chapterContainer.svelte';
import Modules from '../../routes/(bible)/bible/components/modules/modules.svelte';
import StrongsVersesRefs from '../../routes/(bible)/bible/components/refs/strongs-verses-refs/strongsVersesRefs.svelte';
import Search from '../../routes/(bible)/components/search.svelte';

/**
 * Component Mapping is responsible for converting the
 * string value of the component class.
 *
 */
export class ComponentMapping {


	/**
	 *
	 * @param componentName string of class to be returned
	 * @returns component class
	 */
	getComponent(componentName: string): any {
		switch (componentName) {
			case 'ChapterContainer':
				return ChapterContainer;
			case 'StrongsVersesRefs':
				return StrongsVersesRefs;
			case 'Search':
				return Search;
			case 'Modules':
				return Modules
		}

		return ChapterContainer;
	}
	/**
		 * recursively traverses the pane tree
		 * updating the buffers with proper
		 * typescript type
		 *
		 * @param p Pane to map the buffer
		 */
	map(p: Pane) {
		if (p.leftPane) {
			this.map(p.leftPane);
		}

		if (p.rightPane) {
			this.map(p.rightPane);
		}

		if (p.buffer.componentName !== 'NullBuffer') {
			p.buffer.component = this.getComponent(p.buffer.componentName);
			p.buffer.onFocus = () => { };
			p.buffer.keyboardBindings = new Map<string, Function>();
		} else {
			p.buffer = new NullBuffer();
		}
	}

}

export let componentMapping = new ComponentMapping();
