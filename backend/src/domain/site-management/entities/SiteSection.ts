import { SiteSectionKey, ISiteSection, IHighlightSection, IVagoNowSection, ILeadershipSection, SiteSectionFilter, ISiteSectionBase } from './SiteSectionTypes';
import { InvalidSectionKeyError, InvalidHighlightError, InvalidVagoNowError, InvalidLeadershipError } from '../errors/SiteSectionErrors';

export type SiteSectionProps = ISiteSection;

export class SiteSection {
  private _props: SiteSectionProps;

  constructor(props: SiteSectionProps) {
    this._props = props;
  }

  static create(props: SiteSectionProps): SiteSection {
    if (!props.sectionKey) {
      throw new InvalidSectionKeyError();
    }
    if (props.sectionKey === SiteSectionKey.Highlights) {
      const highlight = props as IHighlightSection;
      if (!highlight.title || !highlight.description) {
        throw new InvalidHighlightError();
      }
    }
    if (props.sectionKey === SiteSectionKey.VagoNow) {
      const vagoNow = props as IVagoNowSection;
      if (!vagoNow.title || !vagoNow.content) {
        throw new InvalidVagoNowError();
      }
    }
    if (props.sectionKey === SiteSectionKey.Leadership) {
      const leader = props as ILeadershipSection;
      if (!leader.title || !leader.position) {
        throw new InvalidLeadershipError();
      }
    }
    return new SiteSection(props);
  }

  get id() { return this._props.id; }
  get sectionKey() { return this._props.sectionKey; }
  get title() { return this._props.title; }
  get description() { return this._props.description; }
  get content() { return (this._props as ISiteSectionBase).content; }
  get image() { return this._props.image; }
  get link() { return this._props.link; }
  get position() { return (this._props as ISiteSectionBase).position; }
  get category() { return this._props.category; }
  get createdAt() { return this._props.createdAt; }
  get updatedAt() { return this._props.updatedAt; }
}

export { SiteSectionFilter };
