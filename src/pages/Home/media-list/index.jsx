import { useEffect, useRef } from "react";
import { Link } from "wouter";
import Image from "~/components/Image";
import Empty from "~/components/empty";
import Loading from "~/components/loading";
import SaveFavoriteButton from "~/components/save-favorite-button";
import Heart from "~/icons/heart.svg?react";
import Sparkles from "~/icons/sparkles.svg?react";
import UserGroup from "~/icons/user-group.svg?react";
import { readMedia } from "~/services/media-services";
import store from "~/store";
import { TMDB, mediaTranslations } from "~/utils/constants.js";
import styles from "./media-list.module.scss";

const { url_img } = TMDB;

export default function MediaList() {
  const { data, page, filterText, isLoading, changeAuxMediaDetails } = store.media();
  const pageRef = useRef(page);
  const filterTextRef = useRef(filterText);

  useEffect(() => {
    if (pageRef.current !== page || filterTextRef.current !== filterText || !data?.length) {
      if (!page) {
        return;
      }

      (async () => {
        await readMedia();

        pageRef.current = page;
        filterTextRef.current = filterText;
      })();
    }
  }, [page, filterText]);

  if (data?.length && !isLoading) {
    return (
      <main className={styles.media}>
        {
          data?.map((item) => {
            const { profile_path, poster_path, title, name, media_type, popularity, vote_average, vote_count, id } = item;
            const imageName = media_type.includes("profile") ? profile_path : poster_path;
            const url = `${url_img}/w400${imageName}`;
            const itemkey = `${id}-${(title ?? name).replaceAll(" ", "_")}`;

            return (
              <article className={styles.card_media} key={itemkey}>
                <SaveFavoriteButton dataToSave={item} className={styles.favorite_button} />

                <Link
                  href="/media-details"
                  onPointerUp={() => {
                    changeAuxMediaDetails(item);
                  }}
                >
                  <Image
                    data-src={url}
                    width="auto"
                    height="600"
                    alt={`Poster de ${title ?? name}`}
                    className={styles.poster}
                  />

                  <footer className={styles.info}>
                    <h2 className={styles.info_title}>{title ?? name}</h2>

                    <div className={styles.statistics}>
                      {
                        popularity ?
                          (
                            <div title="Popularidad" className={styles.popularity}>
                              <UserGroup className={styles.user_groupSVG} />
                              <span>{popularity}</span>
                            </div>
                          )
                          : null
                      }

                      {
                        vote_average ?
                          (
                            <div title="Votación promedio" className={styles.vote_average}>
                              <Sparkles className={styles.starSVG} />
                              <span>{vote_average}</span>
                            </div>
                          )
                          : null
                      }

                      {
                        vote_count ?
                          (
                            <div title="Me gusta" className={styles.vote_count}>
                              <Heart className={styles.heartSVG} />
                              <span>{vote_count}</span>
                            </div>
                          )
                          : null
                      }
                    </div>

                    {
                      mediaTranslations[media_type]
                        ? <span className={styles.media_type}>{mediaTranslations[media_type]}</span>
                        : null
                    }
                  </footer>
                </Link>
              </article>
            )
          })
        }
      </main>
    );
  }

  if (isLoading) {
    return <Loading />
  }

  return <Empty />;
}
