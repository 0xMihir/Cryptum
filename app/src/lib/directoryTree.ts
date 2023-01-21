export class INode {
	name: string;
	parent: INode | null = null;

	constructor(name: string) {
		this.name = name;
	}

	// parses an inode from json, returns null on failure
	static fromJson(json: string): INode | null {
		function parseInode(fileData: Record<string, any>): INode {
			const name = fileData['name'];
			if (name == null) {
				throw {};
			}

			const type = fileData['type'];

			const children = fileData['children'];

			if (type == 'file' && fileData['uuid'] != null) {
				return new UnloadedFile(name, fileData['uuid']);
			} else if (type == 'directory' && children != null) {
				const newDirectory = new Directory(name);

				for (const data in Object.values(children)) {
					newDirectory.addChild(parseInode(data as any));
				}

				return newDirectory;
			} else {
				throw {};
			}
		}

		try {
			const jsonData = JSON.parse(json);
			if (jsonData['type']) return parseInode(jsonData);
		} catch (e) {}

		return null;
	}

	toJson(): string {
		return JSON.stringify(this.serialize());
	}

	serialize(): Record<string, any> {
		throw new Error('unimplemented');
	}
}

export class UnloadedFile extends INode {
	uuid: string;

	constructor(name: string, uuid: string) {
		super(name);
		this.uuid = uuid;
	}

	serialize(): Record<string, any> {
		return {
			type: 'file',
			name: this.name,
			uuid: this.uuid
		};
	}
}

export class File extends INode {
	uuid: string;
	data: string;

	constructor(name: string, uuid: string, data: string) {
		super(name);
		this.uuid = uuid;
		this.data = data;
	}

	serialize(): Record<string, any> {
		return {
			type: 'file',
			name: this.name,
			uuid: this.uuid
		};
	}
}

export class Directory extends INode {
	children: Record<string, INode> = {};

	constructor(name: string) {
		super(name);
	}

	addChild(child: INode) {
		child.parent = this;
		this.children[child.name] = child;
	}

	childrenArray(): Array<INode> {
		return Object.values(this.children);
	}

	serialize(): Record<string, any> {
		return {
			type: 'directory',
			name: this.name,
			children: this.childrenArray().map((child) => child.serialize())
		};
	}
}
