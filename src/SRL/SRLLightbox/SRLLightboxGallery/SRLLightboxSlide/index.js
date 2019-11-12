import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import SRLLightboxThubnailGallery from './SRLLightboxThubnailGallery';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ReactScrollWheelHandler from 'react-scroll-wheel-handler';

import {
    SRLLightboxContent,
    SRRLLightboxCaption,
    SRLLightboxImageContainer,
    SRLLightboxImage,
} from '../styles';


function isUriImage(uri) {
    uri = uri.split('?')[0];
    //moving on, split the uri into parts that had dots before them
    let parts = uri.split('.');
    //get the last part ( should be the extension )
    let extension = parts[parts.length - 1];
    //define some image types to test against
    let imageTypes = ['jpg', 'jpeg', 'webp', 'tiff', 'png', 'gif', 'bmp'];
    //check if the extension matches anything in the list.
    if (imageTypes.indexOf(extension) !== -1) {
        return true;
    }
}

function SRLLightboxSlideComponent({
                                       source,
                                       images,
                                       id,
                                       handleCloseLightbox,
                                       handleCurrentImage,
                                       handleNextImage,
                                       handlePrevImage,
                                       caption,
                                       captionStyle,
                                       showThumbnails,
                                       showCaption,
                                       transitionSpeed,
                                   }) {
    const SRLImageContainerRef = useRef();
    // credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml
    let startX;
    let startY;
    let distX;
    let distY;
    let threshold = 150; // required min distance traveled to be considered swipe
    let restraint = 100; // maximum distance allowed at the same time in perpendicular direction
    let allowedTime = 300; // maximum time allowed to travel that distance
    let elapsedTime;
    let startTime;

    function handleTouchChange(x, y, t, r) {
        // FIRST CONDITION
        /* This is, in a way, a method to check if the action is a Swipe...
           if the finger is held by more than 400 milliseconds, maybe that wasn't a swipe */
        if (elapsedTime <= allowedTime) {
            // SECOND CONDITION
            if (Math.abs(x) >= t) {
                if (x <= 0) {
                    handleNextImage(id);
                } else if (x >= 0) {
                    handlePrevImage(id);
                }
            }
        }
    }

    function handleTouchStart(e) {
        let touchObject = e.changedTouches[0];
        startX = touchObject.pageX;
        startY = touchObject.pageY;
        startTime = new Date().getTime();
    }

    function handleTouchEnd(e) {
        let touchObject = e.changedTouches[0];
        distX = touchObject.pageX - startX;
        distY = touchObject.pageX - startY;
        elapsedTime = new Date().getTime() - startTime;

        // Run the function on touchend
        handleTouchChange(distX, distY, threshold, restraint);
    }

    useOnClickOutside(SRLImageContainerRef, () => handleCloseLightbox());

    return (
        <SRLLightboxContent className="SRLContent">
            <SRLLightboxImageContainer
                showThumbnails={showThumbnails}
                showCaption={showCaption}
                className="SRLImageContainer"
                onTouchStart={e => handleTouchStart(e)}
                onTouchEnd={e => handleTouchEnd(e)}
            >
                <ReactScrollWheelHandler
                    upHandler={() => handleNextImage(id)}
                    downHandler={() => handlePrevImage(id)}
                    disableKeyboard={true}
                >
                    {typeof source === 'object' === 'object' ? (
                        <SRLLightboxImage
                            ref={SRLImageContainerRef}
                            className="SRLImage"
                            transitionSpeed={transitionSpeed}
                            src={'https://www.michelec.site/app/uploads/SRL/SRL_LoadingIcon.gif'}
                            alt={caption}
                        />
                    ) : (
                        isUriImage(source) ? (
                            <SRLLightboxImage
                                ref={SRLImageContainerRef}
                                className="SRLImage"
                                transitionSpeed={transitionSpeed}
                                src={source}
                                alt={caption}
                            />
                        ) : (
                            <video key={source}
                                   className='uploaded-image uploaded-attachment' autoPlay={true} controls>
                                <source src={source}/>
                                Your browser does not support the video tag.
                            </video>
                        )
                    )}

                </ReactScrollWheelHandler>
            </SRLLightboxImageContainer>

            {showCaption && (
                <SRRLLightboxCaption captionStyle={captionStyle} className="SRLCaption">
                    <p className="SRLCaption">{caption}</p>
                </SRRLLightboxCaption>
            )}

            {showThumbnails && (
                <SRLLightboxThubnailGallery
                    handleCurrentImage={handleCurrentImage}
                    currentId={id}
                    images={images || []}
                />
            )}
        </SRLLightboxContent>
    );

    // Hook

    function useOnClickOutside(ref, handler) {
        useEffect(
            () => {
                const listener = event => {
                    // Do nothing if clicking ref's element or descendent elements
                    if (
                        !ref.current ||
                        ref.current.contains(event.target) ||
                        event.target.classList.contains('SRLNextButton') ||
                        event.target.classList.contains('SRLPrevButton') ||
                        event.target.classList.contains('SRLCloseButton') ||
                        event.target.classList.contains('SRLAutoplayButton') ||
                        event.target.classList.contains('SRLThumbnails') ||
                        event.target.classList.contains('SRLThumb') ||
                        event.target.classList.contains('SRLCaption') ||
                        event.type === 'touchstart' ||
                        event.button !== 0
                    ) {
                        return;
                    }

                    handler(event);
                };

                document.addEventListener('mousedown', listener);
                document.addEventListener('touchstart', listener);

                return () => {
                    document.removeEventListener('mousedown', listener);
                    document.removeEventListener('touchstart', listener);
                };
            },
            // Add ref and handler to effect dependencies
            // It's worth noting that because passed in handler is a new ...
            // ... function on every render that will cause this effect ...
            // ... callback/cleanup to run every render. It's not a big deal ...
            // ... but to optimize you can wrap handler in useCallback before ...
            // ... passing it into this hook.
            [ref, handler],
        );
    }
}

SRLLightboxSlideComponent.propTypes = {
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    caption: PropTypes.string,
    captionStyle: PropTypes.shape({
        captionColor: PropTypes.string,
        captionFontFamily: PropTypes.string,
        captionFontSize: PropTypes.string,
        captionFontWeight: PropTypes.string,
        captionFontStyle: PropTypes.string,
    }),
    showThumbnails: PropTypes.bool,
    showCaption: PropTypes.bool,
    transitionSpeed: PropTypes.number,
    images: PropTypes.array,
    handleCloseLightbox: PropTypes.func,
    handleCurrentImage: PropTypes.func,
    handleNextImage: PropTypes.func,
    handlePrevImage: PropTypes.func,
    id: PropTypes.string,
};

export default SRLLightboxSlideComponent;
